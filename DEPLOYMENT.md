# 🚀 WhatsApp Gateway Dashboard - Deployment Guide

## 📦 COMPLETE PROJECT STRUCTURE

```
/app/
├── src/                          # wa-gateway API (existing - DON'T TOUCH)
├── backend/                      # Dashboard Backend (NEW)
│   ├── config/
│   │   ├── db.js                # PostgreSQL connection
│   │   └── migrate.js           # Auto migration script
│   ├── middleware/
│   │   └── auth.js              # JWT middleware
│   ├── routes/
│   │   ├── auth.js              # Login routes
│   │   └── sessions.js          # Session CRUD routes
│   ├── server.js                # Express main server
│   ├── package.json
│   ├── .env.example
│   └── migration.sql            # Manual SQL migration
└── frontend/                     # Dashboard UI (NEW)
    ├── index.html               # Login page
    ├── dashboard.html           # Sessions list page
    ├── detail.html              # Session detail page
    └── assets/
        ├── css/
        │   └── dashboard.css
        └── js/
            ├── config.js        # API config
            ├── login.js
            ├── dashboard.js
            └── detail.js
```

---

## ✅ DEPLOYMENT TO PRODUCTION (3 STEPS)

### **STEP 1: Push ke GitHub**

```bash
git add .
git commit -m "Add WA Gateway Dashboard - Backend + Frontend"
git push origin main
```

### **STEP 2: Deploy Backend di VPS/Easypanel**

#### A. Via Easypanel (Recommended)

1. **Create New Service** di Easypanel
2. **Select Source:** GitHub → Select repository
3. **Build Settings:**
   - Build Path: `/backend`
   - Start Command: `npm start`
   - Port: `5000`

4. **Environment Variables (.env):**
   ```
   DB_USER=postgres
   DB_PASSWORD=a0bd3b3c1d54b7833014
   DB_HOST=postgres_scrapdatan8n
   DB_PORT=5432
   DB_NAME=wa_gateway
   DATABASE_URL=postgres://postgres:a0bd3b3c1d54b7833014@postgres_scrapdatan8n:5432/wa_gateway
   JWT_SECRET=GANTI-DENGAN-RANDOM-STRING-SUPER-STRONG
   WA_GATEWAY_URL=http://localhost:5001
   FRONTEND_URL=https://yourdomain.com
   PORT=5000
   ```

5. **Deploy!** Klik Deploy

#### B. Via Manual SSH (Alternative)

```bash
# SSH ke VPS
ssh user@your-vps-ip

# Clone repository
git clone https://github.com/yourusername/wa-gateway.git
cd wa-gateway/backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
nano .env  # Edit dengan credentials production

# Run database migration
node config/migrate.js

# Start with PM2
npm install -g pm2
pm2 start server.js --name wa-dashboard-backend
pm2 save
pm2 startup
```

### **STEP 3: Setup Database**

#### Option A: Auto Migration (Recommended)

```bash
cd /app/backend
node config/migrate.js
```

Migration akan otomatis create:
- ✅ Table `config` dengan admin default
- ✅ Table `sessions`
- ✅ Table `session_logs`

#### Option B: Manual SQL (DbGate/pgAdmin)

1. Buka DbGate atau pgAdmin
2. Connect ke database `wa_gateway`
3. Run file `migration.sql`

---

## 🌐 DEPLOY FRONTEND

### Option A: GitHub Pages (Free)

1. Push folder `frontend/` ke repository
2. Settings → Pages → Enable
3. Update `API_BASE_URL` di `frontend/assets/js/config.js`:
   ```javascript
   const API_BASE_URL = 'https://your-backend-domain.com/api';
   ```

### Option B: Nginx Static Hosting

```nginx
server {
    listen 80;
    server_name dashboard.yourdomain.com;
    
    root /path/to/frontend;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Option C: Vercel/Netlify

1. Import repository
2. Build Settings: NONE (static files)
3. Publish Directory: `frontend`
4. Deploy!

---

## 🔧 POST-DEPLOYMENT CONFIGURATION

### 1. Update Frontend API URL

Edit `frontend/assets/js/config.js`:

```javascript
const API_BASE_URL = 'https://your-backend-url.com/api';
```

### 2. Test Backend Health

```bash
curl https://your-backend-url.com/api/health
# Should return: {"status":"OK","message":"WA Gateway Dashboard API is running"}
```

### 3. Test Login

1. Buka frontend URL
2. Login dengan:
   - Username: `admin`
   - Password: `admin123`
3. Jika berhasil → redirect ke dashboard

### 4. Verify wa-gateway Connection

Backend harus bisa akses wa-gateway API (localhost:5001). Pastikan:
- wa-gateway running: `curl http://localhost:5001/session`
- Backend bisa proxy request ke wa-gateway

---

## 📋 CHECKLIST DEPLOYMENT

**Backend:**
- [ ] Code pushed ke GitHub/VPS
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` configured dengan credentials production
- [ ] Database migration completed
- [ ] Backend running di port 5000
- [ ] Health check OK: `/api/health`
- [ ] wa-gateway accessible (localhost:5001)

**Frontend:**
- [ ] Static files deployed
- [ ] `API_BASE_URL` updated ke backend production URL
- [ ] Login page accessible
- [ ] CORS configured di backend (FRONTEND_URL)

**Database:**
- [ ] PostgreSQL running
- [ ] Database `wa_gateway` exists
- [ ] Tables created (config, sessions, session_logs)
- [ ] Default admin user inserted

---

## 🎯 USAGE GUIDE

### 1. Login
- URL: `https://your-frontend-url.com`
- Username: `admin`
- Password: `admin123`

### 2. Create Session
1. Dashboard → "Tambah Session"
2. Input session name (lowercase, no spaces)
3. QR Code akan muncul otomatis
4. Scan dengan WhatsApp
5. Session terhubung dalam 5-10 detik

### 3. Configure Webhook
1. Klik "Detail" pada session
2. Isi Webhook URL
3. Toggle event yang diinginkan:
   - ✅ Individual
   - ✅ Group
   - ✅ From Me
   - ✅ Update Status
   - ✅ Image
   - ✅ Video
   - ✅ Audio
   - ✅ Sticker
   - ✅ Document
4. Klik "Save Webhook"

### 4. Test Message
1. Session detail page
2. Input nomor tujuan (628xxx)
3. Tulis pesan
4. Klik "Kirim"

### 5. API Key Management
- Copy API key untuk digunakan
- Regenerate jika perlu (old key akan invalid)

---

## 🔒 SECURITY CHECKLIST

- [ ] **Ganti JWT_SECRET** dengan random string kuat
- [ ] **Ganti password admin** setelah first login
- [ ] **Enable HTTPS** (Let's Encrypt/Cloudflare)
- [ ] **Setup firewall** untuk database (block public access)
- [ ] **Backup database** rutin (cron job)
- [ ] **Monitor logs** (PM2 logs, backend logs)
- [ ] **Rate limiting** untuk API endpoints (optional)

---

## 🐛 TROUBLESHOOTING

### Backend tidak start
```bash
# Check logs
pm2 logs wa-dashboard-backend

# Common issues:
# 1. Port already in use → change PORT in .env
# 2. Database connection error → verify credentials
# 3. wa-gateway not running → start wa-gateway first
```

### Frontend tidak bisa login
```bash
# 1. Check API_BASE_URL di config.js
# 2. Check CORS di backend (.env FRONTEND_URL)
# 3. Check browser console untuk error
# 4. Test backend health: curl https://backend/api/health
```

### QR Code tidak muncul
```bash
# 1. Pastikan wa-gateway running: curl http://localhost:5001/session
# 2. Check WA_GATEWAY_URL di backend .env
# 3. Check backend logs: pm2 logs
```

### Session status tidak update
- Frontend polling setiap 10 detik
- Check browser console
- Verify endpoint: `GET /api/sessions/:id/status`

---

## 📊 DATABASE SCHEMA

### config
```sql
id            SERIAL PRIMARY KEY
username      VARCHAR(255) UNIQUE NOT NULL
password      VARCHAR(255) NOT NULL  -- bcrypt hashed
created_at    TIMESTAMP DEFAULT NOW()
```

### sessions
```sql
id              SERIAL PRIMARY KEY
session_name    VARCHAR(255) UNIQUE NOT NULL
api_key         VARCHAR(255) UNIQUE NOT NULL
webhook_url     TEXT
webhook_events  JSONB  -- 9 event toggles
profile_name    VARCHAR(255)
wa_number       VARCHAR(50)
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

### session_logs
```sql
id          SERIAL PRIMARY KEY
session_id  INTEGER REFERENCES sessions(id) ON DELETE CASCADE
action      VARCHAR(100) NOT NULL
details     TEXT
created_at  TIMESTAMP DEFAULT NOW()
```

---

## 🎉 RESULT

Setelah deployment selesai:

1. **Klik "Open"** di Easypanel/Hosting
2. **Login** dengan admin/admin123
3. **Create session** → scan QR
4. **Session online** dalam hitungan detik
5. **Configure webhook** → toggle events
6. **Ready to use!** 🚀

---

## 📞 SUPPORT

Jika ada masalah deployment:
1. Check logs backend: `pm2 logs` atau Easypanel logs
2. Check browser console (F12)
3. Verify database tables created
4. Test API endpoints dengan curl/Postman

---

**Happy Deploying! 🎊**
