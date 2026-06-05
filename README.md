# 🎓 CampusFlow — Class Routine Management System

Production-ready full-stack MERN application for university class routine management.

## 🚀 Tech Stack
| Layer    | Tech |
|----------|------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend  | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth     | JWT (HttpOnly Cookie) + Refresh Token + bcrypt |
| Security | Helmet, CORS, Rate Limit, express-validator |
| Logging  | Winston + Morgan |
| Email    | Nodemailer (Gmail SMTP) |
| Deploy   | Docker + Nginx + PM2 |

---

## ⚙️ Local Setup

### 1. Backend
```bash
cd server
npm install
cp .env.example .env    # fill in your values
npm run dev
```

### 2. Frontend
```bash
cd client
npm install
npm run dev
```
→ Open http://localhost:5173

---

## 🔑 Create First Admin

Admin can only be created via API directly (not from UI — security):
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@gmail.com","password":"123456"}'
```
Then manually set role in MongoDB:
```js
db.users.updateOne({ email: "admin@gmail.com" }, { $set: { role: "admin" } })
```

---

## 📧 Gmail Email Setup

1. Go to → https://myaccount.google.com/security
2. Enable **2-Step Verification**
3. Search **"App passwords"** → Select **Mail** → Generate
4. Copy the 16-digit password into `.env`:
```
SMTP_USER=your@gmail.com
SMTP_PASS=abcdefghijklmnop
```
5. Restart server → `npm run dev`

---

## 🐳 Deploy with Docker

```bash
# Copy and fill .env
cp server/.env.example server/.env

# Build and start everything
docker-compose up -d --build

# View logs
docker-compose logs -f server
```
→ App runs at http://localhost:80

---

## 🔧 Deploy with PM2 (without Docker)

```bash
npm install -g pm2

# Start in cluster mode (uses all CPU cores)
pm2 start ecosystem.config.js --env production

# Save and auto-start on reboot
pm2 save
pm2 startup
```

---

## ✅ Security Features
- 🍪 HttpOnly Cookie (XSS-proof — no token in localStorage)
- 🔄 Refresh Token rotation (7 days)
- 🔐 Access Token (15 min)
- 🛡 Helmet security headers
- ⚡ Rate limiting (10 login/15min, 200 API/15min)
- ✅ Input validation backend + frontend
- 🔒 bcrypt password hashing (salt 12)
- 🚫 Role cannot be set via register API
- 🗜 Response compression

## ✅ Features
- 📅 Routine CRUD + conflict detection
- 🔍 Search + Pagination
- 🖨 Print / PDF Export
- 📊 Analytics Dashboard
- 🛡 Audit Log
- 🔗 Public Routine View
- 🌙 Dark/Light Theme
- 📱 Mobile Responsive
- ⚙ Profile + Password Change
- 🔑 Forgot/Reset Password (email link)
- 📧 Email notifications
- 📆 Semester Archive
- 🏛 Multi-Department

## 🌐 API Endpoints
| Method | Route | Auth |
|--------|-------|------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| POST | /api/auth/refresh | Public (cookie) |
| POST | /api/auth/logout | Public |
| POST | /api/auth/forgot-password | Public |
| POST | /api/auth/reset-password/:token | Public |
| PUT  | /api/auth/change-password | Auth |
| GET  | /api/routine | Public |
| POST | /api/routine | Admin |
| GET  | /api/routine/conflicts | Admin |
| GET  | /api/audit | Admin |

---

## 🧪 Running Tests

```bash
cd server

# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

Tests use **in-memory MongoDB** — no real database needed!

**Test files:**
- `__tests__/auth.test.js` — Register, Login, Logout, Change Password, Forgot Password
- `__tests__/routine.test.js` — CRUD, Conflict Detection, Pagination
- `__tests__/crud.test.js` — Teachers, Courses, Rooms, Departments

---

## 📖 API Documentation (Swagger)

After starting the server, open:
```
http://localhost:5000/api/docs
```

Interactive API docs with all endpoints, request/response schemas, and auth info.

---

## 🛡 Error Handling

- **Backend:** Global error handler catches all unhandled errors
- **Frontend:** React Error Boundary catches component crashes — shows friendly error UI instead of blank screen
- **Env Validation:** Server refuses to start if required env variables are missing
