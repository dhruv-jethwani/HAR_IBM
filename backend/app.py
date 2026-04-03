from datetime import datetime
import base64
import requests
import tempfile
import jwt
import os
import time
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from PIL import Image
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

app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    "connect_args": {
        "ssl": {
            "ca": "/etc/ssl/certs/ca-certificates.crt" 
        }
    }
}

db = SQLAlchemy()
db.init_app(app)

# 4. AI Model Client
client = Client("darkangel106/har-api")

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
    timestamp = db.Column(db.DateTime, default=datetime.now)

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
        return jsonify({
            "message": "Login successful",
            "email": user.email # Added for React localStorage
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

# Route to see your uploaded images in browser
@app.route('/static/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/healthz')
def health_check():
    return "OK", 200

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)