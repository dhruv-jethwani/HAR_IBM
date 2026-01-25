from flask import Flask, jsonify, request, redirect, render_template
from flask_cors import CORS

app = Flask(__name__)
# This line tells Flask to allow requests from your React app
CORS(app) 

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
    full_name = data.get('fullName')
    email = data.get('email')
    
    return jsonify({
        "message": "Registration successful",
        "user": full_name,
        "email": email
    }), 201


if __name__ == "__main__":
    app.run(debug=True, port=5000)