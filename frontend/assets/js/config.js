// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get token
function getToken() {
    return localStorage.getItem('token');
}

// Helper function to check authentication
function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Helper function to show toast
function showToast(type, message) {
    const toastId = type === 'success' ? 'successToast' : 'errorToast';
    const messageId = type === 'success' ? 'successMessage' : 'errorMessage';
    
    document.getElementById(messageId).textContent = message;
    const toast = new bootstrap.Toast(document.getElementById(toastId));
    toast.show();
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}
