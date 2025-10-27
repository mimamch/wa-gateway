// Check authentication
if (!checkAuth()) {
    throw new Error('Not authenticated');
}

// Get session ID from URL
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get('id');

if (!sessionId) {
    showToast('error', 'Session ID tidak ditemukan');
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 2000);
}

let session = null;
let statusPolling = null;
let qrPolling = null;

// Load session details
async function loadSessionDetails() {
    try {
        const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            session = data.session;
            renderSessionDetails();
            updateStatus();
            startStatusPolling();
            checkQRCode();
        } else {
            showToast('error', data.error || 'Gagal memuat detail session');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        }
    } catch (error) {
        console.error('Load session details error:', error);
        showToast('error', 'Terjadi kesalahan saat memuat detail session');
    }
}

// Render session details
function renderSessionDetails() {
    document.getElementById('sessionName').textContent = session.session_name;
    document.getElementById('profileName').textContent = session.profile_name || 'Belum terhubung';
    document.getElementById('waNumber').textContent = session.wa_number || '-';
    document.getElementById('createdAt').textContent = new Date(session.created_at).toLocaleString('id-ID');
    document.getElementById('apiKey').value = session.api_key;
    
    // Set webhook configuration
    if (session.webhook_url) {
        document.getElementById('webhookUrl').value = session.webhook_url;
    }
    
    const events = session.webhook_events || {};
    document.getElementById('webhookIndividual').checked = events.individual || false;
    document.getElementById('webhookGroup').checked = events.group || false;
    document.getElementById('webhookFromMe').checked = events.from_me || false;
    document.getElementById('webhookUpdateStatus').checked = events.update_status || false;
    document.getElementById('webhookImage').checked = events.image || false;
    document.getElementById('webhookVideo').checked = events.video || false;
    document.getElementById('webhookAudio').checked = events.audio || false;
    document.getElementById('webhookSticker').checked = events.sticker || false;
    document.getElementById('webhookDocument').checked = events.document || false;
}

// Update status
async function updateStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/status`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            const statusBadge = document.getElementById('statusBadge');
            statusBadge.textContent = data.status;
            statusBadge.className = 'badge';
            
            if (data.status === 'online' || data.status === 'connected') {
                statusBadge.classList.add('bg-success');
                // Hide QR section if online
                document.getElementById('qrSection').style.display = 'none';
            } else if (data.status === 'connecting') {
                statusBadge.classList.add('bg-warning');
            } else {
                statusBadge.classList.add('bg-danger');
                // Show QR section if offline
                document.getElementById('qrSection').style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Update status error:', error);
    }
}

// Start status polling
function startStatusPolling() {
    // Clear existing interval
    if (statusPolling) {
        clearInterval(statusPolling);
    }
    
    // Poll every 10 seconds
    statusPolling = setInterval(updateStatus, 10000);
}

// Check QR code
async function checkQRCode() {
    try {
        const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/qr`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            const qrContainer = document.getElementById('qrCodeContainer');
            
            if (data.qr) {
                qrContainer.innerHTML = `<img src="${data.qr}" alt="QR Code" class="img-fluid" style="max-width: 300px;">`;
                startQRPolling();
            } else if (data.status === 'connected' || data.status === 'online') {
                qrContainer.innerHTML = '<p class="text-success"><i class="bi bi-check-circle"></i> Session sudah terhubung</p>';
            } else {
                qrContainer.innerHTML = '<p class="text-muted">Klik tombol di bawah untuk generate QR Code</p>';
            }
        }
    } catch (error) {
        console.error('Check QR code error:', error);
    }
}

// Start QR polling
function startQRPolling() {
    if (qrPolling) {
        clearInterval(qrPolling);
    }
    
    qrPolling = setInterval(checkQRCode, 5000);
}

// Copy API key
function copyApiKey() {
    const apiKeyInput = document.getElementById('apiKey');
    apiKeyInput.select();
    document.execCommand('copy');
    showToast('success', 'API Key berhasil dicopy');
}

// Regenerate API key
async function regenerateApiKey() {
    if (!confirm('Yakin ingin regenerate API key? API key lama akan tidak bisa digunakan.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/regenerate-key`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            document.getElementById('apiKey').value = data.api_key;
            showToast('success', 'API Key berhasil di-regenerate');
        } else {
            showToast('error', data.error || 'Gagal regenerate API key');
        }
    } catch (error) {
        console.error('Regenerate API key error:', error);
        showToast('error', 'Terjadi kesalahan saat regenerate API key');
    }
}

// Save webhook configuration
document.getElementById('webhookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const webhookUrl = document.getElementById('webhookUrl').value;
    const webhookEvents = {
        individual: document.getElementById('webhookIndividual').checked,
        group: document.getElementById('webhookGroup').checked,
        from_me: document.getElementById('webhookFromMe').checked,
        update_status: document.getElementById('webhookUpdateStatus').checked,
        image: document.getElementById('webhookImage').checked,
        video: document.getElementById('webhookVideo').checked,
        audio: document.getElementById('webhookAudio').checked,
        sticker: document.getElementById('webhookSticker').checked,
        document: document.getElementById('webhookDocument').checked
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/webhook`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ webhook_url: webhookUrl, webhook_events: webhookEvents })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showToast('success', 'Konfigurasi webhook berhasil disimpan');
        } else {
            showToast('error', data.error || 'Gagal menyimpan konfigurasi webhook');
        }
    } catch (error) {
        console.error('Save webhook error:', error);
        showToast('error', 'Terjadi kesalahan saat menyimpan konfigurasi webhook');
    }
});

// Test send message
document.getElementById('testMessageForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const phoneNumber = document.getElementById('testPhoneNumber').value;
    const message = document.getElementById('testMessage').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/test-message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ phone_number: phoneNumber, message: message })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showToast('success', 'Pesan berhasil dikirim');
            document.getElementById('testPhoneNumber').value = '';
            document.getElementById('testMessage').value = '';
        } else {
            showToast('error', data.error || 'Gagal mengirim pesan');
        }
    } catch (error) {
        console.error('Send message error:', error);
        showToast('error', 'Terjadi kesalahan saat mengirim pesan');
    }
});

// Delete session
async function deleteSession() {
    if (!confirm('Yakin ingin menghapus session ini? Tindakan ini tidak dapat dibatalkan.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showToast('success', 'Session berhasil dihapus');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        } else {
            showToast('error', data.error || 'Gagal menghapus session');
        }
    } catch (error) {
        console.error('Delete session error:', error);
        showToast('error', 'Terjadi kesalahan saat menghapus session');
    }
}

// Load session details on page load
loadSessionDetails();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (statusPolling) {
        clearInterval(statusPolling);
    }
    if (qrPolling) {
        clearInterval(qrPolling);
    }
});
