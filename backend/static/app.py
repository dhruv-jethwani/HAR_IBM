from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
# This line tells Flask to allow requests from your React app
CORS(app) 

@app.route('/api/test', methods=['GET'])
def test_endpoint():
    return jsonify({"message": "Successfully connected to Flask!"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)