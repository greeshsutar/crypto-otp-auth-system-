# 🔐 Crypto OTP Authentication System

> A production-ready, full-stack authentication system with **OTP-based identity verification**, **JWT authorization**, and **secure bcrypt hashing** — built on Node.js, Express, and MongoDB.

🌐 **Live Demo:** [https://crypto-otp-auth-system.onrender.com](https://crypto-otp-auth-system.onrender.com)

---

## 🚀 What This Project Does

Most apps bolt on authentication as an afterthought. This project treats it as a **first-class concern**.

Users are verified through a **time-limited OTP** (One-Time Password) delivered via **Email or SMS** before they ever get access. Passwords and OTPs are **never stored in plaintext** — everything is hashed. Access to protected routes is gated behind **JWT tokens**.

The result: a secure, multi-channel authentication pipeline you can trust.

---

## ✨ Key Features

| Feature | Detail |
|---|---|
| 📧 Email OTP | Delivered via Nodemailer |
| 📱 SMS OTP | Delivered via Twilio |
| 🔒 Password Hashing | bcrypt with 10 salt rounds |
| 🔑 OTP Hashing | OTP is hashed before DB storage; compared via `bcrypt.compare()` |
| ⏰ OTP Expiry | Auto-expires after 5 minutes |
| 🪙 JWT Auth | Stateless token-based authentication |
| 🛡️ Protected Routes | Middleware-verified JWT on profile endpoint |
| 📦 MVC Architecture | Clean separation of concerns |

---

## 🏗️ Architecture

This project follows a clean **MVC (Model-View-Controller)** pattern:

```
MVC/
│
├── auth/
│   └── auth.js                # JWT middleware (guards protected routes)
│
├── configure/
│   └── login.configure.js     # MongoDB connection setup
│
├── controller/
│   └── login.controller.js    # Core business logic
│
├── model/
│   └── loginmodel.js          # Mongoose schema & data model
│
├── router/
│   └── login.route.js         # Express API routes
│
├── utils/
│   ├── email.js               # Nodemailer — email OTP delivery
│   └── sms.js                 # Twilio — SMS OTP delivery
│
├── view/                      # Frontend (HTML + CSS + Vanilla JS)
│   ├── Signup.html
│   ├── login.html
│   ├── otp-verify.html
│   ├── profile.html
│   └── style.css
│
├── login.server.js            # Entry point
└── .env                       # Environment config
```

---

## 🔁 Complete User Flow

```
┌──────────────┐     POST /user/signup      ┌─────────────────────┐
│   User fills  │ ──────────────────────────▶│  Hash password       │
│   signup form │                            │  Generate OTP        │
└──────────────┘                            │  Hash & store OTP    │
                                            │  Send via Email/SMS  │
                                            └──────────┬──────────┘
                                                       │
                                                       ▼
┌──────────────┐     POST /user/otp-verify  ┌─────────────────────┐
│  User enters  │ ──────────────────────────▶│  Check OTP expiry   │
│     OTP       │                            │  bcrypt.compare()   │
└──────────────┘                            │  Set isVerified=true│
                                            └──────────┬──────────┘
                                                       │
                                                       ▼
┌──────────────┐     POST /user/login       ┌─────────────────────┐
│  User logs in │ ──────────────────────────▶│  Verify password     │
│               │                            │  Issue JWT token    │
└──────────────┘                            └──────────┬──────────┘
                                                       │
                                                       ▼
┌──────────────┐     GET /user/profile      ┌─────────────────────┐
│  User accesses│ ──────────────────────────▶│  Verify JWT token   │
│   profile     │    Authorization: Bearer   │  Return user data   │
└──────────────┘                            └─────────────────────┘
```

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/user/signup` | None | Register a new user; triggers OTP |
| `POST` | `/user/otp-verify` | None | Verify OTP and activate account |
| `POST` | `/user/login` | None | Login and receive JWT token |
| `GET` | `/user/profile` | Bearer Token | Fetch authenticated user's profile |

### Sample Requests

**Signup**
```json
POST /user/signup
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securePassword123"
}
```

**OTP Verify**
```json
POST /user/otp-verify
{
  "email": "jane@example.com",
  "otp": "847291"
}
```

**Login**
```json
POST /user/login
{
  "email": "jane@example.com",
  "password": "securePassword123"
}
// Response: { token: "eyJhbGciOiJIUzI1NiIsInR..." }
```

**Profile** *(Protected)*
```
GET /user/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR...
```

---

## 🔐 Security Design

### Password Security
- Hashed using **bcrypt** with a salt factor of **10**
- Never stored or transmitted in plaintext

### OTP Security
- Generated as a random numeric code
- **Hashed with bcrypt before being stored** in MongoDB
- Verified using `bcrypt.compare()` — the raw OTP is never stored
- **Expires after 5 minutes** — stale OTPs are rejected

### JWT Authentication
- Signed with a secret key via `jsonwebtoken`
- Stored in browser `localStorage` on the frontend
- Verified on every request to protected routes via custom middleware

---

## 🌐 Frontend

Built with pure **HTML, CSS, and Vanilla JavaScript** — no frameworks, just clean fundamentals.

- Responsive layout with a custom design system
- OTP input auto-handling (tab-to-next-field UX)
- Loading states and inline error messages
- JWT token lifecycle: store on login, send on protected requests

**Pages:**
- `/Signup.html` — Registration form
- `/login.html` — Login form
- `/otp-verify.html` — OTP entry
- `/profile.html` — Protected user dashboard

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JSON Web Tokens (JWT) |
| Hashing | bcrypt |
| Email | Nodemailer |
| SMS | Twilio |
| Frontend | HTML5, CSS3, Vanilla JS |
| Hosting | Render |

---

## 🛠️ Local Setup

**1. Clone the repository**
```bash
git clone https://github.com/your-username/crypto-otp-auth-system.git
cd crypto-otp-auth-system
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure environment variables**

Create a `.env` file in the root directory:
```env
PORT=3080
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

TWILIO_SID=your_twilio_account_sid
TWILIO_AUTH=your_twilio_auth_token
TWILIO_PHONE=+1xxxxxxxxxx
```

**4. Start the server**
```bash
node login.server.js
```

Visit `http://localhost:3080/Signup.html`

---

## ⚠️ Known Limitations & Planned Improvements

| Limitation | Status |
|---|---|
| No OTP resend mechanism | 🔜 Planned |
| No rate limiting / brute-force protection | 🔜 Planned |
| No refresh tokens | 🔜 Planned |
| No OAuth (Google/GitHub) | 🔜 Planned |
| OTP attempt count not tracked | 🔜 Planned |

---

## 🧠 What I Learned Building This

- Designing a **multi-channel OTP verification pipeline** (email + SMS)
- Why **hashing OTPs** matters — treating them with the same care as passwords
- Structuring a backend with **MVC** for maintainability and clarity
- **JWT lifecycle** — generation, transport, verification, and expiry
- Deploying a full-stack Node app on **Render** with environment-based config

---

## 📁 Project Pages (Live)

| Page | URL |
|---|---|
| Signup | `/Signup.html` |
| Login | `/login.html` |
| OTP Verify | `/otp-verify.html` |
| Profile | `/profile.html` |

---

## 📜 License

MIT — free to use, modify, and learn from.

---

> Built with 💻 and ☕ — demonstrating that authentication done *right* is both secure and learnable.