from datetime import datetime
import os
import time
import tempfile
import base64
import requests
import jwt
import pytz
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from pathlib import Path
from gradio_client import Client, handle_file

# 1. NEW: Cloudinary Imports
import cloudinary
import cloudinary.uploader

# 1. Setup Paths and Environment
load_dotenv()
ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(ROOT_DIR / '.env')

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'dev_secret_key')

CORS(app, resources={r"/*": {"origins": "*"}})

# 2. NEW: Cloudinary Configuration
cloudinary.config( 
  cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME'), 
  api_key = os.getenv('CLOUDINARY_API_KEY'), 
  api_secret = os.getenv('CLOUDINARY_API_SECRET'),
  secure = True
)

# Folder Configuration
BASE_PATH = Path(__file__).resolve().parent
UPLOAD_FOLDER = os.path.join(BASE_PATH, 'static', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# 3. Database Configuration
MYSQL_USER = os.getenv('MYSQL_USER')
MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD')
MYSQL_HOST = os.getenv('MYSQL_HOST')
MYSQL_PORT = os.getenv('MYSQL_PORT', '4000')
MYSQL_DB = os.getenv('MYSQL_DB', 'test')

ADMIN_USERNAME = os.getenv('ADMIN_USERNAME')
ADMIN_EMAIL = os.getenv('ADMIN_EMAIL')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD')
hashed_admin = generate_password_hash(ADMIN_PASSWORD)

app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    "connect_args": {
        "ssl": True # Updated for better compatibility with Render/TiDB
    }
}

db = SQLAlchemy()
db.init_app(app)

# 4. AI Model Client
client = Client("darkangel106/har-api")
IST = pytz.timezone('Asia/Kolkata')

# Models
class User(UserMixin, db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

    @staticmethod
    def check_user(email):
        return User.query.filter_by(email=email).first()
    
    def verify_password(self, password):
        return check_password_hash(self.password, password)

class History(UserMixin, db.Model):
    __tablename__ = "history"
    ticket_id = db.Column(db.String(100), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    image_name = db.Column(db.String(100), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)
    prediction = db.Column(db.String(100))
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(IST))
    
class ProblemReport(db.Model):
    __tablename__ = "problem_reports"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    description = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), default="Pending")
    admin_reply = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(IST))

# Database Init
with app.app_context():
    try:
        db.create_all() 
        if not User.query.filter_by(email=ADMIN_EMAIL).first():
            admin_user = User(name=ADMIN_USERNAME, email=ADMIN_EMAIL, password=hashed_admin)
            db.session.add(admin_user)
            db.session.commit() 
    except Exception as e:
        print(f"Database sync failed: {e}")

def predict_activity_from_cloud(image_path):
    result = client.predict(img=handle_file(image_path), api_name="/predict")
    return result['label'], result['confidences'][0]['confidence']

# --- ROUTES ---

@app.route('/upload_image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    file = request.files['image']
    user_email = request.form.get('email')
    user = User.check_user(user_email)

    if not user:
        return jsonify({"error": "User not found"}), 401 

    if file and allowed_file(file.filename):
        ext = os.path.splitext(file.filename)[1].lower()
        temp_filename = f"upload_{int(time.time())}_{user.id}{ext}"
        temp_path = os.path.join(tempfile.gettempdir(), temp_filename)
        
        try:
            file.save(temp_path) 
            
            # AI Prediction
            label, score = predict_activity_from_cloud(temp_path)
            label = label.capitalize()
            
            # 5. FIXED: Cloudinary Upload (Replaces ImgBB)
            upload_result = cloudinary.uploader.upload(
                temp_path,
                public_id=f"HAR_{int(time.time())}_{user.id}",
                folder="har_activity_uploads"
            )
            
            if not upload_result.get('secure_url'):
                return jsonify({"error": "Cloudinary upload failed"}), 500
                
            full_image_url = upload_result['secure_url']

            # 6. Save to MySQL
            timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
            temp_ticket_id = f"TEMP_{timestamp_str}_{user.id}"
            
            new_history = History(
                ticket_id=temp_ticket_id,
                user_id=user.id,
                image_name=f"{timestamp_str}{ext}", 
                image_url=full_image_url,
                prediction=label
            )
            db.session.add(new_history)
            db.session.commit()

            return jsonify({
                "label": label, 
                "image_url": full_image_url,
                "ticket_id": temp_ticket_id
            }), 200

        except Exception as e:
            import traceback
            traceback.print_exc()
            return jsonify({"error": f"Processing failed: {str(e)}"}), 500 
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path) 

    return jsonify({"error": "Invalid file type"}), 400

@app.route('/api/report-problem', methods=['POST'])
def report_problem():
    email = request.form.get('email')
    description = request.form.get('description')
    
    if not email or not description:
        return jsonify({"error": "Email and description are required"}), 400

    user = User.check_user(email)
    if not user:
        return jsonify({"error": "User not found"}), 404

    files = request.files.getlist('images')
    uploaded_urls = []
    
    for file in files:
        if file and allowed_file(file.filename):
            ext = os.path.splitext(file.filename)[1].lower()
            temp_filename = f"report_{int(time.time())}_{user.id}_{len(uploaded_urls)}{ext}"
            temp_path = os.path.join(tempfile.gettempdir(), temp_filename)
            
            try:
                file.save(temp_path)
                # Cloudinary Upload for Bug Reports
                res = cloudinary.uploader.upload(
                    temp_path,
                    folder="har_bug_reports"
                )
                if res.get('secure_url'):
                    uploaded_urls.append(res['secure_url'])
            except Exception as e:
                print(f"Cloudinary Report Upload error: {e}")
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)

    final_image_string = ",".join(uploaded_urls) if uploaded_urls else None

    new_report = ProblemReport(
        user_id=user.id, 
        description=description, 
        image_url=final_image_string
    )
    db.session.add(new_report)
    db.session.commit()

    return jsonify({"message": "Problem reported successfully!"}), 201

# --- REMAINING ORIGINAL ROUTES (Login, History, Admin, etc.) ---
# [Include your original login, register, get_history, get_user_reports, update_report, etc. here]

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.check_user(data.get('email'))
    if user and user.verify_password(data.get('password')):
        role = 'admin' if user.email == ADMIN_EMAIL else 'user'
        return jsonify({
            "message": "Login successful",
            "email": user.email,
            "name": user.name,
            "role": role
        }), 200
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name, email, password = data.get('fullName'), data.get('email'), data.get('password')
    if User.check_user(email):
        return jsonify({"error": "Email already registered"}), 400 
    new_user = User(name=name, email=email, password=generate_password_hash(password))
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully"}), 201

@app.route('/api/history/<email>', methods=['GET'])
def get_history(email):
    user = User.check_user(email)
    if not user: return jsonify({"error": "User not found"}), 404
    user_history = History.query.filter_by(user_id=user.id).order_by(History.timestamp.desc()).all()
    return jsonify([{
        "id": h.ticket_id,
        "image": h.image_url,
        "prediction": h.prediction,
        "timestamp": h.timestamp.isoformat()
    } for h in user_history])

@app.route('/api/user-reports/<email>', methods=['GET'])
def get_user_reports(email):
    user = User.check_user(email)
    if not user: return jsonify({"error": "User not found"}), 404
    reports = ProblemReport.query.filter_by(user_id=user.id).order_by(ProblemReport.timestamp.desc()).all()
    return jsonify([{
        "ticket_id": r.id,
        "description": r.description,
        "image_urls": r.image_url.split(',') if r.image_url else [],
        "status": r.status,
        "admin_reply": r.admin_reply,
        "timestamp": r.timestamp.isoformat()
    } for r in reports])

@app.route('/api/admin/update-report', methods=['POST'])
def update_report():
    data = request.get_json()
    if data.get('admin_email') != ADMIN_EMAIL:
        return jsonify({"error": "Unauthorized"}), 403
    report = db.session.get(ProblemReport, data.get('ticket_id'))
    if not report: return jsonify({"error": "Report not found"}), 404
    report.status = data.get('status')
    report.admin_reply = data.get('admin_reply')
    db.session.commit()
    return jsonify({"message": "Ticket updated successfully"}), 200

@app.route('/healthz')
def health_check():
    return "OK", 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)