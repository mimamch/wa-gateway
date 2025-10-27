# WhatsApp Gateway Dashboard

Dashboard modern untuk mengelola multi-session WhatsApp Gateway. Sistem ini terdiri dari backend Express.js dan frontend static yang mudah di-deploy.

## 🚀 Fitur

### Backend (Express.js)
- ✅ Single user authentication dengan JWT
- ✅ CRUD session management (unlimited sessions)
- ✅ Webhook configuration untuk 9 event types
- ✅ API key generation & regeneration
- ✅ Proxy ke wa-gateway API
- ✅ Test send message
- ✅ Real-time session status
- ✅ Activity logging

### Frontend (Vanilla JS + Bootstrap)
- ✅ Login page dengan error handling
- ✅ Dashboard dengan list semua sessions
- ✅ Real-time status polling (setiap 10 detik)
- ✅ Add session dengan QR code auto-display
- ✅ Detail page dengan konfigurasi lengkap
- ✅ Webhook events toggle (Individual, Group, From Me, Update Status, Image, Video, Audio, Sticker, Document)
- ✅ API key management
- ✅ Test message form
- ✅ Delete session dengan konfirmasi
- ✅ Responsive design

## 📁 Struktur Project

```
/app/
├── src/                      # wa-gateway API (existing, jangan diubah)
├── backend/                  # Dashboard Backend API
│   ├── config/
│   │   ├── db.js            # PostgreSQL connection
│   │   └── migrate.js       # Database migration
│   ├── middleware/
│   │   └── auth.js          # JWT authentication
│   ├── routes/
│   │   ├── auth.js          # Login & auth routes
│   │   └── sessions.js      # Session management routes
│   ├── server.js            # Express server
│   ├── package.json
│   ├── .env.example
│   └── .env
└── frontend/                 # Static Dashboard UI
    ├── index.html           # Login page
    ├── dashboard.html       # Sessions list
    ├── detail.html          # Session detail & config
    └── assets/
        ├── css/
        │   └── dashboard.css
        └── js/
            ├── config.js
            ├── login.js
            ├── dashboard.js
            └── detail.js
```

## 🛠 Setup & Installation

### Prerequisites
- Node.js v18+
- PostgreSQL database
- wa-gateway API running di localhost:5001

### 1. Setup Database

Database yang digunakan: **wa_gateway** (BUKAN postgres)

Jalankan migration untuk membuat tables:

```bash
cd /app/backend
node config/migrate.js
```

Migration akan membuat:
- Table `config` dengan default admin (username: admin, password: admin123)
- Table `sessions` untuk menyimpan session data
- Table `session_logs` untuk activity logs

### 2. Setup Backend

```bash
cd /app/backend

# Install dependencies
npm install

# Copy .env.example ke .env (sudah ada)
# Edit .env sesuai konfigurasi database Anda

# Start backend server
npm start
```

Backend akan running di `http://localhost:5000`

### 3. Setup Frontend

Frontend adalah static files, bisa di-deploy ke:
- GitHub Pages
- Nginx static hosting
- Any web server

Untuk development, gunakan simple HTTP server:

```bash
cd /app/frontend

# Option 1: Using Python
python3 -m http.server 8080

# Option 2: Using Node.js http-server
npx http-server -p 8080
```

Frontend akan accessible di `http://localhost:8080`

## 🔧 Konfigurasi

### Backend (.env)

```env
DB_USER=postgres
DB_PASSWORD=a0bd3b3c1d54b7833014
DB_HOST=postgres_scrapdatan8n
DB_PORT=5432
DB_NAME=wa_gateway
DATABASE_URL=postgres://postgres:a0bd3b3c1d54b7833014@postgres_scrapdatan8n:5432/wa_gateway
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
WA_GATEWAY_URL=http://localhost:5001
FRONTEND_URL=http://localhost:8080
PORT=5000
```

### Frontend (assets/js/config.js)

Update `API_BASE_URL` sesuai backend URL Anda:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify token

### Sessions
- `GET /api/sessions` - Get all sessions
- `GET /api/sessions/:id` - Get session by ID
- `GET /api/sessions/:id/status` - Get real-time status
- `GET /api/sessions/:id/qr` - Get QR code
- `POST /api/sessions` - Create new session
- `PUT /api/sessions/:id/webhook` - Update webhook config
- `POST /api/sessions/:id/regenerate-key` - Regenerate API key
- `POST /api/sessions/:id/test-message` - Test send message
- `DELETE /api/sessions/:id` - Delete session

## 🔑 Default Credentials

```
Username: admin
Password: admin123
```

**PENTING:** Ganti password default setelah first login!

## 🎯 Cara Penggunaan

### 1. Login
- Buka frontend di browser
- Login dengan credentials default (admin/admin123)

### 2. Tambah Session
- Klik tombol "Tambah Session"
- Masukkan nama session (contoh: mysession)
- QR Code akan muncul otomatis
- Scan QR Code dengan WhatsApp
- Session akan terhubung dalam beberapa detik

### 3. Konfigurasi Webhook
- Klik "Detail" pada session
- Isi Webhook URL
- Toggle event yang diinginkan:
  - Individual Messages
  - Group Messages
  - From Me
  - Update Status
  - Image
  - Video
  - Audio
  - Sticker
  - Document
- Klik "Save Webhook"

### 4. Test Message
- Di halaman detail session
- Masukkan nomor tujuan (format: 628123456789)
- Tulis pesan
- Klik "Kirim"

### 5. Regenerate API Key
- Klik tombol "Regenerate" di section API Key
- API key baru akan generated
- Copy untuk digunakan

## 🚢 Deploy ke Production

### Backend (VPS/Server)

```bash
# Clone repository
git clone <your-repo>
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
nano .env  # Edit dengan kredensial production

# Run migration
node config/migrate.js

# Start dengan PM2 (recommended)
npm install -g pm2
pm2 start server.js --name wa-dashboard-backend
pm2 save
pm2 startup
```

### Frontend (GitHub Pages / Nginx)

#### Option A: GitHub Pages
1. Push folder `frontend/` ke repository
2. Enable GitHub Pages di Settings
3. Update `API_BASE_URL` di `assets/js/config.js` dengan backend production URL

#### Option B: Nginx
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    root /path/to/frontend;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

## 🔒 Security Notes

1. **Ganti JWT_SECRET** di .env dengan random string yang kuat
2. **Ganti password default admin** setelah first login
3. **Enable HTTPS** di production
4. **Setup firewall** untuk database dan backend
5. **Backup database** secara rutin

## 🐛 Troubleshooting

### Backend tidak bisa connect ke database
- Cek kredensial di .env
- Pastikan PostgreSQL running
- Pastikan database `wa_gateway` sudah dibuat
- Test koneksi: `psql -U postgres -h postgres_scrapdatan8n -d wa_gateway`

### Frontend tidak bisa connect ke backend
- Cek `API_BASE_URL` di `assets/js/config.js`
- Pastikan backend running di port yang benar
- Cek CORS configuration di backend

### QR Code tidak muncul
- Pastikan wa-gateway API running di localhost:5001
- Cek `WA_GATEWAY_URL` di backend .env
- Check logs backend untuk error

### Session status tidak update
- Frontend melakukan polling setiap 10 detik
- Pastikan endpoint `/api/sessions/:id/status` bisa diakses
- Check browser console untuk error

## 📝 Database Schema

### Table: config
```sql
id SERIAL PRIMARY KEY
username VARCHAR(255) UNIQUE NOT NULL
password VARCHAR(255) NOT NULL
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Table: sessions
```sql
id SERIAL PRIMARY KEY
session_name VARCHAR(255) UNIQUE NOT NULL
api_key VARCHAR(255) UNIQUE NOT NULL
webhook_url TEXT
webhook_events JSONB DEFAULT '{...}'
profile_name VARCHAR(255)
wa_number VARCHAR(50)
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Table: session_logs
```sql
id SERIAL PRIMARY KEY
session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE
action VARCHAR(100) NOT NULL
details TEXT
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

## 🤝 Contributing

Feel free to submit issues and pull requests!

## 📄 License

MIT License

## 🙋‍♂️ Support

Jika ada pertanyaan atau butuh bantuan, silakan buka issue di repository ini.

---

**Dibuat dengan ❤️ untuk kemudahan management WhatsApp Gateway**
