document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    const loginText = document.getElementById('loginText');
    const loginSpinner = document.getElementById('loginSpinner');
    
    // Show loading
    loginBtn.disabled = true;
    loginText.classList.add('d-none');
    loginSpinner.classList.remove('d-none');
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Save token
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.user.username);
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            // Show error toast
            document.getElementById('errorMessage').textContent = data.error || 'Login gagal';
            const toast = new bootstrap.Toast(document.getElementById('errorToast'));
            toast.show();
        }
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('errorMessage').textContent = 'Terjadi kesalahan. Periksa koneksi Anda.';
        const toast = new bootstrap.Toast(document.getElementById('errorToast'));
        toast.show();
    } finally {
        // Hide loading
        loginBtn.disabled = false;
        loginText.classList.remove('d-none');
        loginSpinner.classList.add('d-none');
    }
});
