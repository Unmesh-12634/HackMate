// Shared authentication utilities

// Check if user is logged in
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const user = localStorage.getItem('user');
    
    if (!isLoggedIn || !user) {
        return false;
    }
    
    try {
        JSON.parse(user);
        return true;
    } catch (e) {
        // Invalid user data, clear storage
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        return false;
    }
}

// Redirect to login if not authenticated
function requireAuth() {
    if (!checkAuth()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Get current user data
function getCurrentUser() {
    if (!checkAuth()) {
        return null;
    }
    
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        return null;
    }
}

// Update user data
function updateUser(userData) {
    localStorage.setItem('user', JSON.stringify(userData));
}

// Logout user
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'index.html';
}

// Simulate login process
function simulateLogin(email, password) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const userData = {
                email: email,
                name: email.split('@')[0],
                teams: []
            };
            
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('isLoggedIn', 'true');
            
            resolve(userData);
        }, 1000);
    });
}

// Simulate signup process
function simulateSignup(firstName, lastName, email, password) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const userData = {
                email: email,
                name: `${firstName} ${lastName}`,
                teams: []
            };
            
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('isLoggedIn', 'true');
            
            resolve(userData);
        }, 1000);
    });
}

// Show/hide loading state on buttons
function setButtonLoading(buttonId, isLoading) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    
    const textSpan = btn.querySelector('.btn-text');
    const loadingSpan = btn.querySelector('.btn-loading');
    
    if (isLoading) {
        btn.classList.add('loading');
        btn.disabled = true;
        if (textSpan) textSpan.style.display = 'none';
        if (loadingSpan) loadingSpan.style.display = 'inline';
    } else {
        btn.classList.remove('loading');
        btn.disabled = false;
        if (textSpan) textSpan.style.display = 'inline';
        if (loadingSpan) loadingSpan.style.display = 'none';
    }
}

// Utility function to get team from URL parameter
function getTeamFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const teamId = urlParams.get('team');
    
    if (!teamId) return null;
    
    const user = getCurrentUser();
    if (!user || !user.teams) return null;
    
    return user.teams.find(team => team.id.toString() === teamId);
}

// Utility function to save team data back to localStorage
function saveTeamData(updatedTeam) {
    const user = getCurrentUser();
    if (!user) return false;
    
    user.teams = user.teams.map(team => 
        team.id === updatedTeam.id ? updatedTeam : team
    );
    
    updateUser(user);
    return true;
}

// Generate unique ID
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format date and time for display
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show toast notification (simple implementation)
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#EF4444' : type === 'success' ? '#10B981' : '#3B82F6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-family: inherit;
        font-size: 14px;
        max-width: 300px;
        word-wrap: break-word;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Initialize common page functionality
function initializePage() {
    // Re-initialize Lucide icons after dynamic content changes
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Handle escape key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (modal.style.display === 'block') {
                    modal.style.display = 'none';
                }
            });
        }
    });
}

// Call initialization when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}
