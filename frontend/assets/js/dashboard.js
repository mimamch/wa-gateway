// Check authentication
if (!checkAuth()) {
    throw new Error('Not authenticated');
}

// Set username
document.getElementById('username').textContent = localStorage.getItem('username') || 'Admin';

let sessions = [];
let pollingInterval = null;

// Load sessions
async function loadSessions() {
    try {
        const response = await fetch(`${API_BASE_URL}/sessions`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            sessions = data.sessions;
            renderSessions();
            // Start polling for status updates
            startStatusPolling();
        } else {
            showToast('error', data.error || 'Gagal memuat sessions');
        }
    } catch (error) {
        console.error('Load sessions error:', error);
        showToast('error', 'Terjadi kesalahan saat memuat sessions');
    }
}

// Render sessions
function renderSessions() {
    const container = document.getElementById('sessionsList');
    
    if (sessions.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-inbox" style="font-size: 80px; color: #ccc;"></i>
                <p class="text-muted mt-3">Belum ada session. Klik "Tambah Session" untuk memulai.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = sessions.map(session => `
        <div class="col-md-6 col-lg-4">
            <div class="card session-card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="mb-0">${session.session_name}</h5>
                        <span class="badge bg-secondary" id="status-${session.id}">Loading...</span>
                    </div>
                    <p class="text-muted mb-2">
                        <i class="bi bi-person"></i> ${session.profile_name || 'Belum terhubung'}
                    </p>
                    <p class="text-muted mb-3">
                        <i class="bi bi-phone"></i> ${session.wa_number || '-'}
                    </p>
                    <div class="d-grid gap-2">
                        <a href="detail.html?id=${session.id}" class="btn btn-primary btn-sm">
                            <i class="bi bi-gear"></i> Detail
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Start status polling
function startStatusPolling() {
    // Clear existing interval
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }
    
    // Update status immediately
    updateAllStatus();
    
    // Poll every 10 seconds
    pollingInterval = setInterval(updateAllStatus, 10000);
}

// Update all session status
async function updateAllStatus() {
    for (const session of sessions) {
        await updateSessionStatus(session.id);
    }
}

// Update single session status
async function updateSessionStatus(sessionId) {
    try {
        const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/status`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            const statusBadge = document.getElementById(`status-${sessionId}`);
            if (statusBadge) {
                statusBadge.textContent = data.status;
                statusBadge.className = 'badge';
                
                if (data.status === 'online' || data.status === 'connected') {
                    statusBadge.classList.add('bg-success');
                } else if (data.status === 'connecting') {
                    statusBadge.classList.add('bg-warning');
                } else {
                    statusBadge.classList.add('bg-danger');
                }
            }
        }
    } catch (error) {
        console.error('Update status error:', error);
    }
}

// Create session
let createSessionPolling = null;

async function createSession() {
    const sessionName = document.getElementById('sessionName').value.trim();
    
    if (!sessionName) {
        showToast('error', 'Nama session harus diisi');
        return;
    }
    
    const createBtn = document.getElementById('createSessionBtn');
    createBtn.disabled = true;
    createBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Membuat...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ session_name: sessionName })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showToast('success', 'Session berhasil dibuat');
            
            // Show QR code section
            document.getElementById('qrCodeContainer').classList.remove('d-none');
            createBtn.classList.add('d-none');
            
            // Start polling for QR code
            const sessionId = data.session.id;
            pollQRCode(sessionId);
        } else {
            showToast('error', data.error || 'Gagal membuat session');
            createBtn.disabled = false;
            createBtn.innerHTML = '<i class="bi bi-plus-circle"></i> Buat Session';
        }
    } catch (error) {
        console.error('Create session error:', error);
        showToast('error', 'Terjadi kesalahan saat membuat session');
        createBtn.disabled = false;
        createBtn.innerHTML = '<i class="bi bi-plus-circle"></i> Buat Session';
    }
}

// Poll for QR code
async function pollQRCode(sessionId) {
    let attempts = 0;
    const maxAttempts = 60; // 60 attempts = 5 minutes
    
    createSessionPolling = setInterval(async () => {
        attempts++;
        
        if (attempts > maxAttempts) {
            clearInterval(createSessionPolling);
            showToast('error', 'Timeout menunggu QR Code');
            bootstrap.Modal.getInstance(document.getElementById('addSessionModal')).hide();
            loadSessions();
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/qr`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                if (data.qr) {
                    // Show QR code
                    document.getElementById('qrCodeImage').src = data.qr;
                } else if (data.status === 'connected' || data.status === 'online') {
                    // Connected!
                    clearInterval(createSessionPolling);
                    showToast('success', 'Session berhasil terhubung!');
                    bootstrap.Modal.getInstance(document.getElementById('addSessionModal')).hide();
                    loadSessions();
                }
            }
        } catch (error) {
            console.error('Poll QR code error:', error);
        }
    }, 5000); // Poll every 5 seconds
}

// Reset modal when closed
document.getElementById('addSessionModal').addEventListener('hidden.bs.modal', () => {
    document.getElementById('sessionName').value = '';
    document.getElementById('qrCodeContainer').classList.add('d-none');
    document.getElementById('qrCodeImage').src = '';
    document.getElementById('createSessionBtn').classList.remove('d-none');
    document.getElementById('createSessionBtn').disabled = false;
    document.getElementById('createSessionBtn').innerHTML = '<i class="bi bi-plus-circle"></i> Buat Session';
    
    if (createSessionPolling) {
        clearInterval(createSessionPolling);
    }
});

// Load sessions on page load
loadSessions();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }
    if (createSessionPolling) {
        clearInterval(createSessionPolling);
    }
});
