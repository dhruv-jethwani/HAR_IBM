from flask import Flask, jsonify, request, redirect, render_template
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
# This line tells Flask to allow requests from your React app
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy()
db.init_app(app)

class User(UserMixin, db.Model):
    

    @staticmethod
    def check_user(email):
        #DB query for searching for user in the database.
        pass #remove this line after adding logic

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
    return jsonify({
        "message": "Login successful",
        "email": email,
        "token": "your-auth-token-here"
    }), 200

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

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
