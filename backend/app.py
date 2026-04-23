from datetime import datetime
import base64
import requests
import tempfile
import jwt
import os
import time
import pytz
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from pathlib import Path
from gradio_client import Client, handle_file

# 1. Setup Paths and Environment
load_dotenv()
ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(ROOT_DIR / '.env')

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'dev_secret_key')

# FIXED: Explicit CORS for React frontend
CORS(app, resources={r"/*": {"origins": "*"}})

# 2. Folder Configuration
# Ensures the path is absolute to avoid "missing" files
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
IMGBB_API_KEY = os.getenv('IMGBB_API_KEY')
ADMIN_USERNAME = os.getenv('ADMIN_USERNAME')
ADMIN_EMAIL = os.getenv('ADMIN_EMAIL')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD')
hashed_admin = generate_password_hash(ADMIN_PASSWORD)

app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    "connect_args": {
        "ssl": {
            "ca": "/etc/ssl/certs/ca-certificates.crt",
            "check_hostname": False  # Add this line
        }
    }
}

db = SQLAlchemy()
db.init_app(app)

# 4. AI Model Client
client = Client("darkangel106/har-api")

IST = pytz.timezone('Asia/Kolkata')

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

    @staticmethod
    def check_admin():
        return User.query.filter_by(email=ADMIN_EMAIL).first()
    
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
    image_url = db.Column(db.String(500), nullable=True) # Nullable in case a user reports a text-only problem
    status = db.Column(db.String(50), default="Pending")
    admin_reply = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(IST))
    
with app.app_context():
    try:
        print("Checking/Creating database tables...")
        db.create_all()
        if User.check_admin():
            print("Admin user already exists.")
        else:
            admin_user = User(name=ADMIN_USERNAME, email=ADMIN_EMAIL, password=hashed_admin)
            db.session.add(admin_user)
            db.session.commit()
            print("Admin User created successfully.")
            
        print("Database tables are ready!")
    except Exception as e:
        print(f"Database sync failed: {e}")

def predict_activity_from_cloud(image_path):
    result = client.predict(
        img=handle_file(image_path),
        api_name="/predict"
    )
    prediction = result['label']
    confidence = result['confidences'][0]['confidence']
    return prediction, confidence

# --- ROUTES ---

@app.route('/api/chatbot-token', methods=['POST'])
def get_chatbot_token():
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = User.check_user(email)
    if not user:
        return jsonify({"error": "User not found"}), 401

    secret = os.getenv('CHATBOT_IDENTITY_SECRET', 'your_temporary_dev_secret')
    
    # FIXED: Use integer timestamp for 'exp' to avoid library conflicts
    payload = {
        "user_id": str(user.id),
        "email": user.email,
        "name": user.name,
        "iat": int(time.time()),
        "exp": int(time.time()) + 3600  # Expires in 1 hour
    }
    
    try:
        token = jwt.encode(payload, secret, algorithm='HS256')
        return jsonify({"token": token})
    except Exception as e:
        print(f"JWT Error: {e}")
        return jsonify({"error": "Internal Token Error"}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data: return jsonify({"error": "No data provided"}), 400
    
    user = User.check_user(data.get('email'))
    if user and user.verify_password(data.get('password')):
        # Determine role
        role = 'admin' if user.email == ADMIN_EMAIL else 'user'
        
        return jsonify({
            "message": "Login successful",
            "email": user.email,
            "name": user.name,  # Pass the username here
            "role": role
        }), 200
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name, email, password = data.get('fullName'), data.get('email'), data.get('password')
    
    if User.check_user(email):
        return jsonify({"error": "Email already registered"}), 400
    
    hashed_password = generate_password_hash(password)
    new_user = User(name=name, email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully"}), 201

@app.route('/api/history/<email>', methods=['GET'])
def get_history(email):
    user = User.check_user(email)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Query history for this user
    user_history = History.query.filter_by(user_id=user.id).order_by(History.timestamp.desc()).all()
    
    return jsonify([{
        "id": h.ticket_id,
        "image": h.image_url,
        "prediction": h.prediction,
        "timestamp": h.timestamp.isoformat()
    } for h in user_history])

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
        # 1. Create a safe temporary path manually to avoid Windows File Locking
        ext = os.path.splitext(file.filename)[1].lower()
        temp_filename = f"upload_{int(time.time())}_{user.id}{ext}"
        temp_path = os.path.join(tempfile.gettempdir(), temp_filename)
        
        try:
            # 2. Save the file to the temp path and ensure the stream is closed
            file.save(temp_path)
            
            # 3. Get AI Prediction (The file is now unlocked and readable by other libs)
            label, score = predict_activity_from_cloud(temp_path)
            label = label.capitalize()
            
            # 4. Read the file for ImgBB encoding
            with open(temp_path, "rb") as f:
                base64_image = base64.b64encode(f.read())

            # 5. Upload to ImgBB
            timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
            payload = {
                "key": IMGBB_API_KEY,
                "image": base64_image,
                "name": timestamp_str 
            }
            
            imgbb_res = requests.post("https://api.imgbb.com/1/upload", data=payload).json()
            
            if 'data' not in imgbb_res:
                return jsonify({"error": "ImgBB upload failed"}), 500
                
            full_image_url = imgbb_res['data']['url']

            # 6. Save to MySQL
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
            print(f"Error detail: {e}") # This will show the real error in your terminal
            return jsonify({"error": f"Processing failed: {str(e)}"}), 500
            
        finally:
            # 7. ALWAYS delete the file from your local drive after processing
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except Exception as cleanup_error:
                    print(f"Cleanup warning: {cleanup_error}")

    return jsonify({"error": "Invalid file type"}), 400

@app.route('/api/report-problem', methods=['POST'])
def report_problem():
    # Because of the file upload, we use form data instead of JSON
    email = request.form.get('email')
    description = request.form.get('description')
    
    if not email or not description:
        return jsonify({"error": "Email and description are required"}), 400

    user = User.check_user(email)
    if not user:
        return jsonify({"error": "User not found"}), 404

    image_url = None
    
    # Handle image upload to ImgBB if an image was provided
    if 'image' in request.files:
        file = request.files['image']
        if file and allowed_file(file.filename):
            ext = os.path.splitext(file.filename)[1].lower()
            temp_filename = f"report_{int(time.time())}_{user.id}{ext}"
            temp_path = os.path.join(tempfile.gettempdir(), temp_filename)
            
            try:
                file.save(temp_path)
                
                with open(temp_path, "rb") as f:
                    base64_image = base64.b64encode(f.read())

                # Upload to ImgBB
                timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
                payload = {
                    "key": IMGBB_API_KEY,
                    "image": base64_image,
                    "name": f"bug_report_{timestamp_str}"
                }
                
                imgbb_res = requests.post("https://api.imgbb.com/1/upload", data=payload).json()
                
                if 'data' in imgbb_res:
                    image_url = imgbb_res['data']['url']
                    
            except Exception as e:
                print(f"ImgBB Upload error: {e}")
                return jsonify({"error": "Failed to upload image."}), 500
            finally:
                if os.path.exists(temp_path):
                    try:
                        os.remove(temp_path)
                    except Exception as cleanup_error:
                        print(f"Cleanup warning: {cleanup_error}")

    # Save the ticket to the database
    new_report = ProblemReport(
        user_id=user.id, 
        description=description, 
        image_url=image_url
    )
    db.session.add(new_report)
    db.session.commit()

    return jsonify({"message": "Problem reported successfully!"}), 201

# 1. Get reports for a specific user (for SupportPage.tsx)
@app.route('/api/user-reports/<email>', methods=['GET'])
def get_user_reports(email):
    user = User.check_user(email)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    reports = ProblemReport.query.filter_by(user_id=user.id).order_by(ProblemReport.timestamp.desc()).all()
    
    return jsonify([{
        "ticket_id": r.id,
        "description": r.description,
        "image_url": r.image_url,
        "status": getattr(r, 'status', 'Open'), # Default to Open if column doesn't exist yet
        "admin_reply": getattr(r, 'admin_reply', None),
        "timestamp": r.timestamp.isoformat()
    } for r in reports])

# 2. Update a report (for AdminDashboard.tsx)
@app.route('/api/admin/update-report', methods=['POST'])
def update_report():
    data = request.get_json()
    admin_email = data.get('admin_email')
    
    # Simple admin check
    if admin_email != ADMIN_EMAIL:
        return jsonify({"error": "Unauthorized. Admin access restricted."}), 403

    ticket_id = data.get('ticket_id')
    new_status = data.get('status')
    new_reply = data.get('admin_reply')

    # Fetch report
    report = db.session.get(ProblemReport, ticket_id)
    if not report:
        return jsonify({"error": "Report not found"}), 404

    try:
        report.status = new_status
        report.admin_reply = new_reply
        db.session.commit()
        return jsonify({"message": "Ticket updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Update error: {e}")
        return jsonify({"error": "Database update failed"}), 500

@app.route('/api/admin-dashboard', methods=['POST'])
def admin_dashboard():
    data = request.get_json()
    
    if not data or 'email' not in data:
        return jsonify({"error": "Email is required"}), 400
        
    user_email = data.get('email')
    
    # Verify Admin Status
    if user_email != ADMIN_EMAIL:
        return jsonify({"error": "Unauthorized. Admin access restricted."}), 403

    # Fetch all problem reports, newest first
    reports = ProblemReport.query.order_by(ProblemReport.timestamp.desc()).all()
    
    # Format the data to send to the frontend
    tickets = []
    for report in reports:
        # Get the user who submitted this report to include their email/name
        reporting_user = db.session.get(User, report.user_id) 
        
        tickets.append({
            "ticket_id": report.id,
            "user_email": reporting_user.email if reporting_user else "Unknown",
            "user_name": reporting_user.name if reporting_user else "Unknown",
            "description": report.description,
            "image_url": report.image_url, # Will be null if no image was uploaded
            "timestamp": report.timestamp.isoformat(),
            "status": report.status,        # Make sure this is included!
    		"admin_reply": report.admin_reply # Make sure this is included!
        })
    
    return jsonify({
        "message": "Welcome Admin",
        "tickets": tickets
    }), 200

# Route to see your uploaded images in browser
@app.route('/static/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/healthz')
def health_check():
    return "OK", 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)