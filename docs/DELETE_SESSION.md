# Fungsi Menghapus Session WhatsApp Gateway

Dokumentasi lengkap untuk menghapus session di wa-gateway.

## Endpoint yang Tersedia

### 1. DELETE /session/:session (Rekomendasi)

Endpoint RESTful dengan validasi dan error handling yang lebih baik.

**URL:** `DELETE http://localhost:5001/session/{SESSION_ID}`

**Headers:**

```
key: YOUR_API_KEY
```

**Parameter:**

- `session` (path parameter) - Session ID yang ingin dihapus

**Contoh Request dengan cURL:**

```bash
curl -X DELETE "http://localhost:5001/session/36be407f-1400-46f1-b259-58e3aa4f6179" \
  -H "key: secret"
```

**Contoh Request dengan JavaScript/Fetch:**

```javascript
async function deleteSession(sessionId) {
  try {
    const response = await fetch(`http://localhost:5001/session/${sessionId}`, {
      method: "DELETE",
      headers: {
        key: "secret", // Ganti dengan API key Anda
      },
    });

    const result = await response.json();
    console.log("Session deleted:", result);
    return result;
  } catch (error) {
    console.error("Error deleting session:", error);
    throw error;
  }
}

// Cara menggunakan:
deleteSession("36be407f-1400-46f1-b259-58e3aa4f6179");
```

**Contoh Request dengan Axios:**

```javascript
const axios = require("axios");

async function deleteSession(sessionId) {
  try {
    const response = await axios.delete(
      `http://localhost:5001/session/${sessionId}`,
      {
        headers: {
          key: "secret",
        },
      },
    );

    console.log("Session deleted:", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Error:", error.response.data.message);
    } else {
      console.error("Error:", error.message);
    }
    throw error;
  }
}

// Cara menggunakan:
deleteSession("36be407f-1400-46f1-b259-58e3aa4f6179");
```

**Response Success (200):**

```json
{
  "success": true,
  "message": "Session '36be407f-1400-46f1-b259-58e3aa4f6179' deleted successfully",
  "data": {
    "session": "36be407f-1400-46f1-b259-58e3aa4f6179",
    "deletedAt": "2026-02-03T04:52:38.123Z"
  }
}
```

**Response Error (404 - Session Not Found):**

```json
{
  "message": "Session '36be407f-1400-46f1-b259-58e3aa4f6179' not found"
}
```

**Response Error (400 - Missing Session ID):**

```json
{
  "message": "Session ID is required"
}
```

**Response Error (500 - Internal Server Error):**

```json
{
  "message": "Failed to delete session: [error description]"
}
```

---

### 2. ALL /session/logout (Endpoint Lama)

Endpoint untuk backward compatibility.

**URL:** `GET/POST http://localhost:5001/session/logout`

**Method 1 - GET Request:**

```bash
curl "http://localhost:5001/session/logout?session=36be407f-1400-46f1-b259-58e3aa4f6179" \
  -H "key: secret"
```

**Method 2 - POST Request:**

```bash
curl -X POST "http://localhost:5001/session/logout" \
  -H "Content-Type: application/json" \
  -H "key: secret" \
  -d '{"session": "36be407f-1400-46f1-b259-58e3aa4f6179"}'
```

**Response:**

```json
{
  "data": "success"
}
```

---

## Implementasi di Frontend

### Contoh dengan React:

```jsx
import { useState } from "react";

function SessionManager() {
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleDeleteSession = async (e) => {
    e.preventDefault();

    if (!sessionId) {
      setMessage("Session ID harus diisi");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:5001/session/${sessionId}`,
        {
          method: "DELETE",
          headers: {
            key: "secret", // Ganti dengan API key Anda
          },
        },
      );

      const result = await response.json();

      if (response.ok) {
        setMessage(`✅ ${result.message}`);
        setSessionId(""); // Clear input
      } else {
        setMessage(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Hapus Session WhatsApp</h2>
      <form onSubmit={handleDeleteSession}>
        <input
          type="text"
          placeholder="Session ID"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Menghapus..." : "Hapus Session"}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default SessionManager;
```

---

## Fungsi Helper untuk Node.js Backend

Buat file `helpers/session.js`:

```javascript
const axios = require("axios");

const WA_GATEWAY_URL = process.env.WA_GATEWAY_URL || "http://localhost:5001";
const WA_GATEWAY_KEY = process.env.WA_GATEWAY_KEY || "secret";

/**
 * Menghapus session WhatsApp
 * @param {string} sessionId - Session ID yang akan dihapus
 * @returns {Promise<Object>} Response dari API
 */
async function deleteWhatsAppSession(sessionId) {
  if (!sessionId) {
    throw new Error("Session ID is required");
  }

  try {
    const response = await axios.delete(
      `${WA_GATEWAY_URL}/session/${sessionId}`,
      {
        headers: {
          key: WA_GATEWAY_KEY,
        },
      },
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    if (error.response) {
      // Server responded with error
      return {
        success: false,
        error: error.response.data.message || "Failed to delete session",
        statusCode: error.response.status,
      };
    } else {
      // Network or other error
      return {
        success: false,
        error: error.message || "Network error",
      };
    }
  }
}

/**
 * Mendapatkan semua session yang aktif
 * @returns {Promise<Array>} List of active sessions
 */
async function getAllSessions() {
  try {
    const response = await axios.get(`${WA_GATEWAY_URL}/session`, {
      headers: {
        key: WA_GATEWAY_KEY,
      },
    });

    return response.data.data || [];
  } catch (error) {
    console.error("Error getting sessions:", error.message);
    return [];
  }
}

/**
 * Menghapus semua session yang disconnected
 * @returns {Promise<Object>} Summary hasil penghapusan
 */
async function deleteDisconnectedSessions() {
  try {
    const sessions = await getAllSessions();
    const disconnected = sessions.filter((s) => s.status === "disconnected");

    const results = await Promise.allSettled(
      disconnected.map((s) => deleteWhatsAppSession(s.session)),
    );

    const deleted = results.filter(
      (r) => r.status === "fulfilled" && r.value.success,
    );
    const failed = results.filter(
      (r) => r.status === "rejected" || !r.value.success,
    );

    return {
      total: disconnected.length,
      deleted: deleted.length,
      failed: failed.length,
      sessions: disconnected.map((s) => s.session),
    };
  } catch (error) {
    throw new Error(`Failed to delete disconnected sessions: ${error.message}`);
  }
}

module.exports = {
  deleteWhatsAppSession,
  getAllSessions,
  deleteDisconnectedSessions,
};
```

**Cara menggunakan:**

```javascript
const {
  deleteWhatsAppSession,
  deleteDisconnectedSessions,
} = require("./helpers/session");

// Menghapus satu session
async function example1() {
  const result = await deleteWhatsAppSession(
    "36be407f-1400-46f1-b259-58e3aa4f6179",
  );

  if (result.success) {
    console.log("Session deleted:", result.data);
  } else {
    console.error("Failed:", result.error);
  }
}

// Menghapus semua session yang disconnected
async function example2() {
  const result = await deleteDisconnectedSessions();
  console.log(
    `Deleted ${result.deleted} of ${result.total} disconnected sessions`,
  );
}
```

---

## Testing

### Test dengan Postman:

1. Method: `DELETE`
2. URL: `http://localhost:5001/session/36be407f-1400-46f1-b259-58e3aa4f6179`
3. Headers:
   - Key: `key`
   - Value: `secret`

### Test dengan Thunder Client (VS Code):

```json
{
  "method": "DELETE",
  "url": "http://localhost:5001/session/36be407f-1400-46f1-b259-58e3aa4f6179",
  "headers": {
    "key": "secret"
  }
}
```

---

## Catatan Penting

1. **Authentication**: Semua endpoint memerlukan API key yang valid melalui header `key`
2. **Session ID**: Session ID harus valid dan ada di sistem
3. **Error Handling**: Selalu implementasikan proper error handling di aplikasi Anda
4. **Cleanup**: Saat session dihapus, semua data terkait (credentials, status) juga akan dihapus
5. **Logs**: Session yang dihapus akan dicatat di console server

---

## Troubleshooting

### Error: "Session not found"

- Pastikan Session ID yang Anda gunakan benar
- Cek list session yang tersedia dengan `GET /session`

### Error: "Unauthorized" atau "Forbidden"

- Periksa API key di header request
- Pastikan API key sesuai dengan yang ada di `docker-compose.yaml`

### Error: "Failed to delete session"

- Cek logs di server untuk detail error
- Pastikan session tidak sedang dalam proses koneksi
- Coba logout terlebih dahulu sebelum delete

---

## Endpoint Terkait

- `GET /session` - Mendapatkan list semua session
- `POST /session/start` - Membuat session baru
- `DELETE /session/:session` - Menghapus session (endpoint baru)
- `ALL /session/logout` - Logout session (endpoint lama)
