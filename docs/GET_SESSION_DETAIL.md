# API: Get Session Detail

Dokumentasi lengkap untuk mendapatkan detail session WhatsApp Gateway.

## Endpoint

### GET /session/:session

Mendapatkan detail lengkap dari session tertentu berdasarkan Session ID.

**URL:** `GET http://localhost:5001/session/{SESSION_ID}`

**Headers:**

```
key: YOUR_API_KEY
```

**Parameter:**

- `session` (path parameter) - Session ID yang ingin dilihat detailnya

---

## Contoh Request

### cURL

```bash
curl -X GET "http://localhost:5001/session/36be407f-1400-46f1-b259-58e3aa4f6179" \
  -H "key: secret"
```

### JavaScript/Fetch

```javascript
async function getSessionDetail(sessionId) {
  try {
    const response = await fetch(`http://localhost:5001/session/${sessionId}`, {
      method: "GET",
      headers: {
        key: "secret", // Ganti dengan API key Anda
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Session detail:", result);
    return result;
  } catch (error) {
    console.error("Error getting session detail:", error);
    throw error;
  }
}

// Cara menggunakan:
getSessionDetail("36be407f-1400-46f1-b259-58e3aa4f6179").then((data) => {
  console.log("Status:", data.data.status);
  console.log("Phone:", data.data.details.phoneNumber);
  console.log("Name:", data.data.details.name);
});
```

### Axios

```javascript
const axios = require("axios");

async function getSessionDetail(sessionId) {
  try {
    const response = await axios.get(
      `http://localhost:5001/session/${sessionId}`,
      {
        headers: {
          key: "secret",
        },
      },
    );

    console.log("Session detail:", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Error:", error.response.data.message);
      console.error("Status:", error.response.status);
    } else {
      console.error("Error:", error.message);
    }
    throw error;
  }
}

// Cara menggunakan:
getSessionDetail("36be407f-1400-46f1-b259-58e3aa4f6179");
```

---

## Response

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "session": "36be407f-1400-46f1-b259-58e3aa4f6179",
    "status": "connected",
    "details": {
      "name": "John Doe",
      "phoneNumber": "62881084530530"
    },
    "connection": {
      "isConnected": true,
      "lastUpdate": "2026-02-03T04:55:30.123Z"
    },
    "metadata": {
      "platform": "android",
      "deviceManufacturer": "Samsung",
      "deviceModel": "SM-G998B"
    }
  }
}
```

### Error Response (404 - Session Not Found)

```json
{
  "message": "Session '36be407f-1400-46f1-b259-58e3aa4f6179' not found"
}
```

### Error Response (400 - Missing Session ID)

```json
{
  "message": "Session ID is required"
}
```

---

## Response Fields

| Field                              | Type    | Description                                                               |
| ---------------------------------- | ------- | ------------------------------------------------------------------------- |
| `success`                          | boolean | Status keberhasilan request                                               |
| `data.session`                     | string  | Session ID                                                                |
| `data.status`                      | string  | Status koneksi: `connected`, `connecting`, `disconnected`, atau `unknown` |
| `data.details.name`                | string  | Nama akun WhatsApp                                                        |
| `data.details.phoneNumber`         | string  | Nomor telepon WhatsApp                                                    |
| `data.connection.isConnected`      | boolean | Apakah session sedang terkoneksi                                          |
| `data.connection.lastUpdate`       | string  | Timestamp terakhir update (ISO 8601)                                      |
| `data.metadata.platform`           | string  | Platform device (android/ios/unknown)                                     |
| `data.metadata.deviceManufacturer` | string  | Manufacturer device                                                       |
| `data.metadata.deviceModel`        | string  | Model device                                                              |

---

## Implementasi di Frontend

### React Component

```jsx
import { useState, useEffect } from "react";

function SessionDetail({ sessionId }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSessionDetail();
  }, [sessionId]);

  const fetchSessionDetail = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:5001/session/${sessionId}`,
        {
          headers: {
            key: "secret", // Ganti dengan API key Anda
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch session detail");
      }

      const result = await response.json();
      setSession(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!session) return <div>No session found</div>;

  return (
    <div className="session-detail">
      <h2>Session Detail</h2>

      <div className="info-group">
        <h3>Basic Info</h3>
        <p>
          <strong>Session ID:</strong> {session.session}
        </p>
        <p>
          <strong>Status:</strong>
          <span className={`status-${session.status}`}>
            {session.status.toUpperCase()}
          </span>
        </p>
      </div>

      <div className="info-group">
        <h3>Account Details</h3>
        <p>
          <strong>Name:</strong> {session.details.name || "N/A"}
        </p>
        <p>
          <strong>Phone:</strong> {session.details.phoneNumber || "N/A"}
        </p>
      </div>

      <div className="info-group">
        <h3>Connection</h3>
        <p>
          <strong>Connected:</strong>{" "}
          {session.connection.isConnected ? "Yes" : "No"}
        </p>
        <p>
          <strong>Last Update:</strong>{" "}
          {new Date(session.connection.lastUpdate).toLocaleString()}
        </p>
      </div>

      <div className="info-group">
        <h3>Device Information</h3>
        <p>
          <strong>Platform:</strong> {session.metadata.platform}
        </p>
        <p>
          <strong>Manufacturer:</strong> {session.metadata.deviceManufacturer}
        </p>
        <p>
          <strong>Model:</strong> {session.metadata.deviceModel}
        </p>
      </div>

      <button onClick={fetchSessionDetail}>Refresh</button>
    </div>
  );
}

export default SessionDetail;
```

### Vue Component

```vue
<template>
  <div class="session-detail">
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else-if="session">
      <h2>Session Detail</h2>

      <div class="info-group">
        <h3>Basic Info</h3>
        <p><strong>Session ID:</strong> {{ session.session }}</p>
        <p>
          <strong>Status:</strong>
          <span :class="`status-${session.status}`">
            {{ session.status.toUpperCase() }}
          </span>
        </p>
      </div>

      <div class="info-group">
        <h3>Account Details</h3>
        <p><strong>Name:</strong> {{ session.details.name || "N/A" }}</p>
        <p>
          <strong>Phone:</strong> {{ session.details.phoneNumber || "N/A" }}
        </p>
      </div>

      <div class="info-group">
        <h3>Connection</h3>
        <p>
          <strong>Connected:</strong>
          {{ session.connection.isConnected ? "Yes" : "No" }}
        </p>
        <p>
          <strong>Last Update:</strong>
          {{ formatDate(session.connection.lastUpdate) }}
        </p>
      </div>

      <div class="info-group">
        <h3>Device Information</h3>
        <p><strong>Platform:</strong> {{ session.metadata.platform }}</p>
        <p>
          <strong>Manufacturer:</strong>
          {{ session.metadata.deviceManufacturer }}
        </p>
        <p><strong>Model:</strong> {{ session.metadata.deviceModel }}</p>
      </div>

      <button @click="fetchSessionDetail">Refresh</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    sessionId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      session: null,
      loading: true,
      error: null,
    };
  },
  mounted() {
    this.fetchSessionDetail();
  },
  methods: {
    async fetchSessionDetail() {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(
          `http://localhost:5001/session/${this.sessionId}`,
          {
            headers: {
              key: "secret",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch session detail");
        }

        const result = await response.json();
        this.session = result.data;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleString();
    },
  },
};
</script>
```

---

## Helper Functions untuk Node.js

```javascript
const axios = require("axios");

const WA_GATEWAY_URL = process.env.WA_GATEWAY_URL || "http://localhost:5001";
const WA_GATEWAY_KEY = process.env.WA_GATEWAY_KEY || "secret";

/**
 * Mendapatkan detail session WhatsApp
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Session detail
 */
async function getSessionDetail(sessionId) {
  if (!sessionId) {
    throw new Error("Session ID is required");
  }

  try {
    const response = await axios.get(`${WA_GATEWAY_URL}/session/${sessionId}`, {
      headers: {
        key: WA_GATEWAY_KEY,
      },
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        error: error.response.data.message || "Failed to get session detail",
        statusCode: error.response.status,
      };
    } else {
      return {
        success: false,
        error: error.message || "Network error",
      };
    }
  }
}

/**
 * Mengecek apakah session sedang connected
 * @param {string} sessionId - Session ID
 * @returns {Promise<boolean>} True jika connected
 */
async function isSessionConnected(sessionId) {
  const result = await getSessionDetail(sessionId);

  if (!result.success) {
    return false;
  }

  return result.data?.connection?.isConnected || false;
}

/**
 * Mendapatkan informasi akun WhatsApp dari session
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object|null>} Account info atau null
 */
async function getSessionAccount(sessionId) {
  const result = await getSessionDetail(sessionId);

  if (!result.success) {
    return null;
  }

  return {
    name: result.data?.details?.name || "",
    phoneNumber: result.data?.details?.phoneNumber || "",
  };
}

/**
 * Monitor status session secara berkala
 * @param {string} sessionId - Session ID
 * @param {Function} callback - Callback dipanggil setiap interval
 * @param {number} interval - Interval dalam ms (default: 30000)
 * @returns {Function} Function untuk stop monitoring
 */
function monitorSession(sessionId, callback, interval = 30000) {
  const fetchAndNotify = async () => {
    const result = await getSessionDetail(sessionId);
    callback(result);
  };

  // Initial fetch
  fetchAndNotify();

  // Set interval
  const intervalId = setInterval(fetchAndNotify, interval);

  // Return function to stop monitoring
  return () => clearInterval(intervalId);
}

module.exports = {
  getSessionDetail,
  isSessionConnected,
  getSessionAccount,
  monitorSession,
};
```

### Contoh Penggunaan Helper:

```javascript
const {
  getSessionDetail,
  isSessionConnected,
  getSessionAccount,
  monitorSession,
} = require("./helpers/session");

// 1. Mendapatkan detail lengkap
async function example1() {
  const result = await getSessionDetail("36be407f-1400-46f1-b259-58e3aa4f6179");

  if (result.success) {
    console.log("Session:", result.data);
  } else {
    console.error("Error:", result.error);
  }
}

// 2. Cek apakah session connected
async function example2() {
  const isConnected = await isSessionConnected(
    "36be407f-1400-46f1-b259-58e3aa4f6179",
  );
  console.log("Is connected:", isConnected);
}

// 3. Mendapatkan info akun
async function example3() {
  const account = await getSessionAccount(
    "36be407f-1400-46f1-b259-58e3aa4f6179",
  );

  if (account) {
    console.log("Name:", account.name);
    console.log("Phone:", account.phoneNumber);
  }
}

// 4. Monitor session secara real-time
async function example4() {
  const stopMonitoring = monitorSession(
    "36be407f-1400-46f1-b259-58e3aa4f6179",
    (result) => {
      if (result.success) {
        console.log("Status:", result.data.status);
        console.log("Connected:", result.data.connection.isConnected);
      }
    },
    10000, // Check setiap 10 detik
  );

  // Stop monitoring setelah 1 menit
  setTimeout(() => {
    stopMonitoring();
    console.log("Monitoring stopped");
  }, 60000);
}
```

---

## Testing

### Postman

1. **Method:** `GET`
2. **URL:** `http://localhost:5001/session/36be407f-1400-46f1-b259-58e3aa4f6179`
3. **Headers:**
   - Key: `key`
   - Value: `secret`

### Thunder Client (VS Code)

```json
{
  "method": "GET",
  "url": "http://localhost:5001/session/36be407f-1400-46f1-b259-58e3aa4f6179",
  "headers": {
    "key": "secret"
  }
}
```

### Test Script (Node.js)

```javascript
const axios = require("axios");

async function testGetSessionDetail() {
  const sessionId = "36be407f-1400-46f1-b259-58e3aa4f6179";

  try {
    console.log(`\nTesting GET /session/${sessionId}\n`);

    const response = await axios.get(
      `http://localhost:5001/session/${sessionId}`,
      {
        headers: {
          key: "secret",
        },
      },
    );

    console.log("✅ Success!");
    console.log("Status Code:", response.status);
    console.log("\nResponse:");
    console.log(JSON.stringify(response.data, null, 2));

    // Validate response structure
    const data = response.data.data;
    console.log("\n📋 Session Info:");
    console.log(`  Session ID: ${data.session}`);
    console.log(`  Status: ${data.status}`);
    console.log(`  Name: ${data.details.name}`);
    console.log(`  Phone: ${data.details.phoneNumber}`);
    console.log(`  Connected: ${data.connection.isConnected ? "Yes" : "No"}`);
    console.log(`  Platform: ${data.metadata.platform}`);
    console.log(
      `  Device: ${data.metadata.deviceManufacturer} ${data.metadata.deviceModel}`,
    );
  } catch (error) {
    console.error("❌ Error!");
    if (error.response) {
      console.error("Status Code:", error.response.status);
      console.error("Error Message:", error.response.data.message);
    } else {
      console.error("Error:", error.message);
    }
  }
}

testGetSessionDetail();
```

---

## Use Cases

### 1. Dashboard Monitoring

Gunakan endpoint ini untuk menampilkan status real-time session di dashboard:

```javascript
// Update dashboard setiap 30 detik
setInterval(async () => {
  const sessions = ["session1", "session2", "session3"];

  for (const sessionId of sessions) {
    const result = await getSessionDetail(sessionId);

    if (result.success) {
      updateDashboardUI(sessionId, result.data);
    }
  }
}, 30000);
```

### 2. Health Check Automation

Monitoring otomatis dan restart jika session disconnected:

```javascript
async function healthCheck(sessionId) {
  const result = await getSessionDetail(sessionId);

  if (!result.success) {
    console.error(`Session ${sessionId} not found`);
    return;
  }

  if (!result.data.connection.isConnected) {
    console.log(`Session ${sessionId} is disconnected. Attempting restart...`);
    await restartSession(sessionId);
  } else {
    console.log(`Session ${sessionId} is healthy`);
  }
}
```

### 3. Webhook Notification

Kirim notifikasi jika status session berubah:

```javascript
let previousStatus = {};

async function checkSessionStatus(sessionId, webhookUrl) {
  const result = await getSessionDetail(sessionId);

  if (result.success) {
    const currentStatus = result.data.status;

    if (previousStatus[sessionId] !== currentStatus) {
      // Status berubah, kirim webhook
      await axios.post(webhookUrl, {
        event: "session_status_changed",
        sessionId: sessionId,
        oldStatus: previousStatus[sessionId] || "unknown",
        newStatus: currentStatus,
        timestamp: new Date().toISOString(),
      });

      previousStatus[sessionId] = currentStatus;
    }
  }
}
```

---

## Troubleshooting

### Error: "Session not found"

- Pastikan Session ID yang Anda gunakan benar
- Cek list session yang tersedia dengan `GET /session`
- Session mungkin sudah dihapus

### Error: "Unauthorized" atau "Forbidden"

- Periksa API key di header request
- Pastikan API key sesuai dengan yang ada di `docker-compose.yaml`

### Response dengan status "unknown"

- Session mungkin baru dibuat dan belum selesai koneksi
- Tunggu beberapa saat dan coba lagi

### Metadata device menunjukkan "unknown"

- Informasi device tidak selalu tersedia
- Tergantung pada versi WhatsApp yang digunakan

---

## Endpoint Terkait

- `GET /session` - Mendapatkan list semua session
- `GET /session/:session` - Mendapatkan detail session tertentu (endpoint ini)
- `POST /session/start` - Membuat session baru
- `DELETE /session/:session` - Menghapus session
- `ALL /session/logout` - Logout session
