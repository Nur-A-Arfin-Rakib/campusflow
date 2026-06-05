# 🚀 CampusFlow — Production Deployment Guide
## Platform: Render.com + MongoDB Atlas (Free tier available)

---

## Step 1 — MongoDB Atlas Setup (10 minutes)

1. Go to **https://cloud.mongodb.com** → Sign up / Login
2. **Create a free cluster** → Choose M0 Free → Name it `campusflow`
3. **Database Access** (left menu) → Add New Database User
   - Username: `campusflow`
   - Password: generate a strong one, **save it**
   - Role: **Atlas admin**
4. **Network Access** (left menu) → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`)
5. **Clusters** → Connect → **Connect your application**
   - Driver: Node.js, Version: 5.5 or later
   - Copy the connection string → looks like:
     ```
     mongodb+srv://campusflow:<password>@cluster0.xxxxx.mongodb.net/
     ```
   - Replace `<password>` with your actual password
   - Add `campusflow` as the database name at the end:
     ```
     mongodb+srv://campusflow:yourpass@cluster0.xxxxx.mongodb.net/campusflow?retryWrites=true&w=majority
     ```

---

## Step 2 — Deploy Backend to Render

1. Push your code to **GitHub** (public or private repo works)
2. Go to **https://render.com** → New → **Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Instance Type**: Free (or Starter $7/mo for no sleep)
5. **Environment Variables** → Add these:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `MONGO_URI` | your Atlas URI from Step 1 |
   | `JWT_SECRET` | run `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
   | `CLIENT_URL` | `https://YOUR-FRONTEND.onrender.com` (fill after Step 3) |
   | `SMTP_HOST` | `smtp.gmail.com` |
   | `SMTP_PORT` | `587` |
   | `SMTP_USER` | your Gmail address |
   | `SMTP_PASS` | 16-digit Gmail App Password |

6. Click **Create Web Service** → wait ~3 minutes
7. Note your server URL: `https://campusflow-server.onrender.com`

---

## Step 3 — Deploy Frontend to Render

1. Go to Render → New → **Static Site**
2. Connect same GitHub repo
3. Settings:
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. **Redirects/Rewrites** → Add rule:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: **Rewrite**
   (This makes React Router work — without this, refreshing any page gives 404)
5. Click **Create Static Site**
6. Note your frontend URL: `https://campusflow.onrender.com`
7. **Go back to Step 2** → Update `CLIENT_URL` env var with this frontend URL

---

## Step 4 — Create First Admin User

```bash
# Replace YOUR_SERVER_URL with actual Render URL
curl -X POST https://YOUR_SERVER_URL.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@yourdomain.com","password":"StrongPass123!"}'
```

Then in MongoDB Atlas → Collections → `users` → find your user → edit → change `role` to `"admin"`.

Or use Atlas Data Explorer (easier — click the pencil icon on the document).

---

## Step 5 — Setup CI/CD (GitHub Actions)

1. In Render: Your server service → **Settings** → **Deploy Hook** → copy the URL
2. In GitHub: repo → **Settings** → **Secrets and variables** → **Actions** → New secret:
   - Name: `RENDER_DEPLOY_HOOK_URL`
   - Value: paste the Render deploy hook URL
3. Done! Now every push to `main`:
   - Runs all tests ✅
   - If tests pass → auto-deploys to Render 🚀
   - Pull Requests run tests but don't deploy 🛡

---

## ⚠️ Free Tier Limitations (Render)

| Issue | Fix |
|-------|-----|
| Server sleeps after 15min inactivity | Upgrade to **Starter ($7/mo)** or use UptimeRobot to ping `/api/health` every 10min (free) |
| Cold start takes ~30s | Expected on free tier; upgrade if selling to clients |
| 750 free hours/month | Enough for 1 always-on service |

---

## Selling Checklist ✅

Before selling/showing to clients:

- [ ] Change `JWT_SECRET` to a real 64-char random string
- [ ] Test forgot password email (send a real reset link)
- [ ] Create admin account and verify role change works
- [ ] Add at least one department, semester, teacher, room
- [ ] Add sample routine to show the feature
- [ ] Test on mobile (responsive check)
- [ ] Bookmark `https://your-server.onrender.com/api/docs` (Swagger)

---

## Project Info (for clients)

- **Tech**: React 18 + Node.js + MongoDB
- **Auth**: JWT HttpOnly Cookie (bank-grade security)
- **Hosting**: Render.com (auto-scales, 99.9% uptime on paid tier)
- **Database**: MongoDB Atlas (daily backups, encrypted at rest)
- **Features**: Class routine management, conflict detection, PDF export, analytics, audit log, multi-department, email notifications
