import { Hono } from "hono";
import { basicAuthMiddleware } from "../middlewares/auth.middleware";
import type { User } from "../database/db";
import * as whatsapp from "wa-multi-session";
import { toDataURL } from "qrcode";
import { HTTPException } from "hono/http-exception";

export const createDashboardController = () => {
  const app = new Hono();

  // Apply basic auth to all dashboard routes
  app.use("*", basicAuthMiddleware());

  // User dashboard home
  app.get("/", async (c) => {
    const user = c.get("user") as User;
    
    return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - WA Gateway</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            background: white;
            border-radius: 10px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .header-left h1 {
            color: #333;
            margin-bottom: 5px;
        }
        
        .header-left .subtitle {
            color: #666;
        }
        
        .user-info {
            text-align: right;
        }
        
        .username {
            font-weight: 600;
            color: #667eea;
            font-size: 18px;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 5px;
        }
        
        .badge.admin {
            background: #ffd700;
            color: #333;
        }
        
        .badge.user {
            background: #e0e0e0;
            color: #666;
        }
        
        .card {
            background: white;
            border-radius: 10px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        h2 {
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #f0f0f0;
        }
        
        .quick-actions {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .action-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 10px;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            text-align: center;
        }
        
        .action-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.2);
        }
        
        .action-card .icon {
            font-size: 36px;
            margin-bottom: 10px;
        }
        
        .action-card h3 {
            margin-bottom: 5px;
            font-size: 18px;
        }
        
        .action-card p {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            color: #555;
            font-weight: 500;
        }
        
        input {
            width: 100%;
            padding: 10px;
            border: 2px solid #e0e0e0;
            border-radius: 5px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        
        input:focus {
            outline: none;
            border-color: #667eea;
        }
        
        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: transform 0.2s;
        }
        
        button:hover {
            transform: translateY(-2px);
        }
        
        button:active {
            transform: translateY(0);
        }
        
        .btn-danger {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #f0f0f0;
        }
        
        th {
            background: #f8f9fa;
            color: #333;
            font-weight: 600;
        }
        
        .message {
            padding: 12px;
            border-radius: 5px;
            margin-bottom: 15px;
        }
        
        .message.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .message.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .status-badge.connected {
            background: #d4edda;
            color: #155724;
        }
        
        .status-badge.disconnected {
            background: #f8d7da;
            color: #721c24;
        }
        
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            justify-content: center;
            align-items: center;
        }
        
        .modal.show {
            display: flex;
        }
        
        .modal-content {
            background: white;
            padding: 30px;
            border-radius: 10px;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .modal-header h2 {
            margin: 0;
            border: none;
            padding: 0;
        }
        
        .close {
            font-size: 28px;
            font-weight: bold;
            color: #aaa;
            cursor: pointer;
        }
        
        .close:hover {
            color: #000;
        }
        
        #qrcodeImage {
            text-align: center;
            margin: 20px 0;
        }
        
        #qrcodeImage img {
            max-width: 100%;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-left">
                <h1>📱 WhatsApp Gateway Dashboard</h1>
                <p class="subtitle">Manage your WhatsApp sessions</p>
            </div>
            <div class="user-info">
                <div class="username">${user.username}</div>
                <span class="badge ${user.is_admin === 1 ? 'admin' : 'user'}">
                    ${user.is_admin === 1 ? 'Admin' : 'User'}
                </span>
            </div>
        </div>
        
        ${user.is_admin === 1 ? `
        <div class="card">
            <div class="quick-actions">
                <div class="action-card" onclick="window.location.href='/admin'">
                    <div class="icon">⚙️</div>
                    <h3>Admin Panel</h3>
                    <p>Manage users and settings</p>
                </div>
                <div class="action-card" onclick="showNewSessionModal()">
                    <div class="icon">➕</div>
                    <h3>New Session</h3>
                    <p>Create a new WhatsApp session</p>
                </div>
            </div>
        </div>
        ` : `
        <div class="card">
            <div class="quick-actions">
                <div class="action-card" onclick="showNewSessionModal()">
                    <div class="icon">➕</div>
                    <h3>New Session</h3>
                    <p>Connect a WhatsApp account</p>
                </div>
            </div>
        </div>
        `}
        
        <div class="card">
            <h2>📋 Your Sessions</h2>
            <div id="sessionsMessage"></div>
            <table id="sessionsTable">
                <thead>
                    <tr>
                        <th>Session Name</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="sessionsTableBody">
                    <tr>
                        <td colspan="3" style="text-align: center;">Loading...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    
    <!-- New Session Modal -->
    <div id="newSessionModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Create New Session</h2>
                <span class="close" onclick="closeNewSessionModal()">&times;</span>
            </div>
            <div id="newSessionMessage"></div>
            <form id="newSessionForm">
                <div class="form-group">
                    <label for="sessionName">Session Name</label>
                    <input type="text" id="sessionName" name="sessionName" required 
                           placeholder="e.g., main, business, support">
                </div>
                <button type="submit">Create & Generate QR Code</button>
            </form>
        </div>
    </div>
    
    <!-- QR Code Modal -->
    <div id="qrCodeModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Scan QR Code</h2>
                <span class="close" onclick="closeQrCodeModal()">&times;</span>
            </div>
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 id="qrSessionName" style="color: #667eea;"></h3>
            </div>
            <div class="instructions" style="margin-bottom: 20px; line-height: 1.6;">
                <strong>How to scan:</strong><br>
                1. Open WhatsApp on your phone<br>
                2. Go to Settings → Linked Devices<br>
                3. Tap "Link a Device"<br>
                4. Scan this QR code
            </div>
            <div id="qrcodeImage">Loading QR Code...</div>
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="closeQrCodeModal()">Close</button>
            </div>
        </div>
    </div>
    
    <script>
        const authHeader = 'Basic ' + btoa('${user.username}:' + prompt('Enter your password:'));
        
        function showMessage(elementId, message, type) {
            const el = document.getElementById(elementId);
            el.innerHTML = '<div class="message ' + type + '">' + message + '</div>';
            setTimeout(() => {
                el.innerHTML = '';
            }, 5000);
        }
        
        function showNewSessionModal() {
            document.getElementById('newSessionModal').classList.add('show');
        }
        
        function closeNewSessionModal() {
            document.getElementById('newSessionModal').classList.remove('show');
            document.getElementById('newSessionForm').reset();
            document.getElementById('newSessionMessage').innerHTML = '';
        }
        
        function showQrCodeModal(sessionName, qrCode) {
            document.getElementById('qrSessionName').textContent = sessionName;
            document.getElementById('qrcodeImage').innerHTML = '<img src="' + qrCode + '" alt="QR Code">';
            document.getElementById('qrCodeModal').classList.add('show');
        }
        
        function closeQrCodeModal() {
            document.getElementById('qrCodeModal').classList.remove('show');
            loadSessions();
        }
        
        async function loadSessions() {
            try {
                const response = await fetch('/session', {
                    headers: {
                        'Authorization': authHeader
                    }
                });
                
                const data = await response.json();
                const tbody = document.getElementById('sessionsTableBody');
                
                if (data.data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No sessions found. Create your first session!</td></tr>';
                    return;
                }
                
                tbody.innerHTML = data.data.map(session => {
                    return \`
                        <tr>
                            <td>\${session}</td>
                            <td><span class="status-badge connected">Connected</span></td>
                            <td>
                                <button class="btn-danger" onclick="deleteSession('\${session}')">Disconnect</button>
                            </td>
                        </tr>
                    \`;
                }).join('');
            } catch (error) {
                showMessage('sessionsMessage', 'Failed to load sessions: ' + error.message, 'error');
            }
        }
        
        document.getElementById('newSessionForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const sessionName = formData.get('sessionName');
            
            try {
                const response = await fetch('/session/start', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authHeader
                    },
                    body: JSON.stringify({ session: sessionName })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    if (result.qr) {
                        // Convert QR text to image
                        const qrImage = await fetch('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(result.qr));
                        closeNewSessionModal();
                        showQrCodeModal(result.session || sessionName, 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(result.qr));
                    } else {
                        showMessage('newSessionMessage', 'Session connected successfully!', 'success');
                        setTimeout(() => {
                            closeNewSessionModal();
                            loadSessions();
                        }, 2000);
                    }
                } else {
                    showMessage('newSessionMessage', result.message || 'Failed to create session', 'error');
                }
            } catch (error) {
                showMessage('newSessionMessage', 'Error: ' + error.message, 'error');
            }
        });
        
        async function deleteSession(sessionName) {
            if (!confirm('Are you sure you want to disconnect session "' + sessionName + '"?')) {
                return;
            }
            
            try {
                const response = await fetch('/session/logout?session=' + sessionName, {
                    method: 'POST',
                    headers: {
                        'Authorization': authHeader
                    }
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    showMessage('sessionsMessage', 'Session disconnected successfully!', 'success');
                    loadSessions();
                } else {
                    showMessage('sessionsMessage', result.message || 'Failed to disconnect session', 'error');
                }
            } catch (error) {
                showMessage('sessionsMessage', 'Error: ' + error.message, 'error');
            }
        }
        
        // Load sessions on page load
        loadSessions();
        
        // Refresh sessions every 10 seconds
        setInterval(loadSessions, 10000);
        
        // Close modals when clicking outside
        window.onclick = function(event) {
            const newSessionModal = document.getElementById('newSessionModal');
            const qrCodeModal = document.getElementById('qrCodeModal');
            if (event.target == newSessionModal) {
                closeNewSessionModal();
            }
            if (event.target == qrCodeModal) {
                closeQrCodeModal();
            }
        }
    </script>
</body>
</html>
    `);
  });

  return app;
};
