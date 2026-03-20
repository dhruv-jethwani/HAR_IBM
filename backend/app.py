import datetime
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
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

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
MYSQL_USER = os.getenv('MYSQL_USER', 'root')
MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', 'password')
MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
MYSQL_DB = os.getenv('MYSQL_DB', 'har_ibm')

app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

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

@app.route('/upload_image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    file = request.files['image']
    if file and allowed_file(file.filename):
        try:
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            
            # FIXED: Using file.save() is more reliable for storage
            file.save(filepath)
            
            # Verify file exists before sending to cloud
            if os.path.exists(filepath):
                label, score = predict_activity_from_cloud(filepath)
                return jsonify({"label": label, "score": float(score)}), 200
            else:
                return jsonify({"error": "File system error"}), 500
                
        except Exception as e:
            print(f"Upload error: {str(e)}")
            return jsonify({"error": "Processing failed"}), 500
    return jsonify({"error": "Invalid file"}), 400

# Route to see your uploaded images in browser
@app.route('/static/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)