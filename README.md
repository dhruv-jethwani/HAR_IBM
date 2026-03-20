# HAR_IBM (Human Activity Recognition) ✅

**Short description:** HAR_IBM is a Human Activity Recognition prototype that combines a Flask backend with a React + TypeScript frontend. The app currently supports user registration/login and image uploads for activity analysis (model integration is pending). 

---

## 🚀 Project status (what's done)
- **Backend (Flask)** ✅
  - User model with hashed passwords (SQLAlchemy + Flask-Login)
  - Endpoints: `/api/register`, `/api/login`, `/api/users`, `/api/check-db`, `/api/test` ✅
  - Image upload endpoint: `/upload_image` (accepts JPG/PNG/GIF; saves file and returns a placeholder prediction) ✅
  - Environment config via `.env` and database connection using **MySQL (pymysql)** ✅

- **Frontend (React + TypeScript + Vite + Tailwind)** ✅
  - Login and Registration forms with validation (Zod + react-hook-form) ✅
  - `Dashboard` with `UploadSection` for sending images to backend ✅
  - Client-side UI & state handling: results display and error states ✅

- **Dependencies / tools in use:** Flask, Flask-CORS, Flask-SQLAlchemy, Pillow, python-dotenv, React, TypeScript, Vite, Tailwind, react-hook-form, zod.

---

## ⚙️ What still needs work / TODOs
- Integrate the real HAR model to replace the placeholder prediction (`predicted_label = "WALKING"`). 🔧
- Align API response shapes (e.g., `/api/test` currently returns `{ activity, status }` while frontend expects `{ message }`). ⚠️
- Add proper migrations (Flask-Migrate) and DB schema/versioning.
- Improve authentication (sessions → token-based or secure sessions), add access control.
- Add backend tests, frontend tests, and CI (GitHub Actions).
- Add Docker setup for reproducible local/dev deployment.

---

## 📦 Tech Stack
- Backend: Python, Flask, SQLAlchemy, MySQL (pymysql), Pillow
- Frontend: React, TypeScript, Vite, Tailwind CSS, react-hook-form, Zod
- Dev tools: dotenv, ESLint, TypeScript

---

## 🔧 Local setup (quick start)
Prerequisites: Python 3.10+, Node.js (18+), MySQL

1. Clone repository

```bash
git clone https://github.com/dhruv-jethwani/HAR_IBM.git
cd HAR_IBM
```

2. Backend setup

```bash
cd backend
python -m venv .venv
# activate .venv (Windows)
.\.venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the project root (one level above `backend/`) with these keys as a minimum:

```env
SECRET_KEY=your_secret_key_here
MYSQL_USER=your_db_user
MYSQL_PASSWORD=your_db_password
MYSQL_HOST=localhost
MYSQL_DB=har_ibm
UPLOAD_FOLDER=backend/static
```

Run the Flask app:

```bash
python app.py
# Dev server runs on http://127.0.0.1:5000 by default
```

> Note: On first run the app will call `db.create_all()` to create tables if they do not exist.

3. Frontend setup

```bash
cd ../frontend
npm install
npm run dev
# Open the URL shown by Vite (default: http://localhost:5173)
```

---

## 🧪 How to test features
- Register a new user via the **Register** page (frontend). The backend will create a user in MySQL.
- Login using the credentials (frontend posts to `/api/login`).
- Upload an image from the **Dashboard → Analyze Image** section. The image is posted to `http://127.0.0.1:5000/upload_image`. The backend currently returns a placeholder label.

---

## 🛠 API Reference (quick)
- GET `/api/test` — basic backend status (returns activity + status)
- POST `/api/register` — register: JSON { fullName, email, password, confirmPassword }
- POST `/api/login` — login: JSON { email, password }
- POST `/upload_image` — multipart form upload: field `image` (returns `{ label }`)
- GET `/api/users` — list users
- GET `/api/check-db` — db connection check

---

## ✅ Tips & Notes
> - The frontend's `UploadSection` posts directly to `http://127.0.0.1:5000/upload_image` (not `/api/upload_image`). Keep that in mind if you change routes or enable reverse proxy.
> - CORS is enabled in the backend for local development.

---

## 🤝 Contributing
- Open issues for bugs or feature requests.
- Fork the repo, create a feature branch, add tests, and submit a PR.

---

## ✉️ Contact
dhruvjethwani22@gnu.ac.in

---

Thank you 

