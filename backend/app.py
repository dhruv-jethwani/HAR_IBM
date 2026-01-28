from flask import Flask, jsonify, request, redirect, render_template
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from PIL import Image
import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env from project root (one level above `backend/`)
ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(ROOT_DIR / '.env')

app = Flask(__name__)
# This line tells Flask to allow requests from your React app
CORS(app)
# Upload folder configuration (read from .env or fall back to backend/static)
UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', str(Path(__file__).resolve().parent / 'static'))
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
# Database configuration
MYSQL_USER = os.getenv('MYSQL_USER', 'root')
MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', 'password')
MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
MYSQL_DB = os.getenv('MYSQL_DB', 'har_ibm')

app.config['SQLALCHEMY_DATABASE_URI'] = (
    f'mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy()
db.init_app(app)

class User(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

    @staticmethod
    def check_user(email):
        # DB query for searching for user in the database.
        return User.query.filter_by(email=email).first()
    
    def verify_password(self, password):
        return check_password_hash(self.password, password)

@app.route('/api/test')
def get_activity():
    # In the future, this will be the output of your HAR image processing model
    return jsonify({
        "activity": "WALKING",
        "status": "online"
    })

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = User.check_user(email)

    if user and user.verify_password(password):
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"error": "Email already registered"}), 400

    

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('fullName')
    email = data.get('email')
    password = data.get('password')
    confirm_pass = data.get('confirmPassword')

    if User.check_user(email):
        return jsonify({"error": "Email already registered"}), 400
    if password != confirm_pass:
        return jsonify({"message": "Passwords don't match"}), 400
    
    hashed_password = generate_password_hash(password)
    new_user = User(name=name, email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully"}), 201

@app.route('/upload_image', methods=['POST'])  # Note: Remove '/api/' prefix to match frontend
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image part"}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400
    
    try:
        img = Image.open(file)
        
        # Save image
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        img.save(filepath)
        
        # TODO: Run your HAR model here for prediction
        predicted_label = "WALKING"  # Replace with actual model output
        
        return jsonify({"label": predicted_label}), 200
    
    except Exception as e:
        return jsonify({"error": f"Error: {str(e)}"}), 500

@app.route("/api/users", methods=["GET"])
def fetch_users():
    users = User.query.all()
    result = []

    for user in users:
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email
        })

    return jsonify({
        "total_users": len(result),
        "users": result
    })

@app.route("/api/check-db", methods=["GET"])
def check_db():
    try:
        users = User.query.all()
        return jsonify({
            "status": "Database connected",
            "user_count": len(users)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)