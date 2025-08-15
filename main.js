// Main JavaScript file for HackMate application
// This file contains utilities and global functionality

// Global application state
window.HackMate = {
    currentUser: null,
    currentTeam: null,
    isInitialized: false,
    version: '1.0.0'
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Load user data
    loadUserData();
    
    // Set up global event listeners
    setupGlobalEventListeners();
    
    // Initialize current page
    initializeCurrentPage();
    
    window.HackMate.isInitialized = true;
    console.log('HackMate application initialized successfully');
}

function loadUserData() {
    const userData = localStorage.getItem('user');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (userData && isLoggedIn) {
        try {
            window.HackMate.currentUser = JSON.parse(userData);
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('isLoggedIn');
        }
    }
}

function setupGlobalEventListeners() {
    // Close modals on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        closeDropdowns(e);
    });
    
    // Handle form submissions with enter key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.matches('input:not([type="checkbox"]):not([type="radio"])')) {
            const form = e.target.closest('form');
            if (form && !e.target.matches('textarea')) {
                e.preventDefault();
                const submitButton = form.querySelector('button[type="submit"]');
                if (submitButton && !submitButton.disabled) {
                    submitButton.click();
                }
            }
        }
    });
}

function initializeCurrentPage() {
    const currentPage = getCurrentPage();
    
    switch (currentPage) {
        case 'index':
            initializeIndexPage();
            break;
        case 'login':
            initializeLoginPage();
            break;
        case 'signup':
            initializeSignupPage();
            break;
        case 'teams':
            initializeTeamsPage();
            break;
        case 'dashboard':
            initializeDashboardPage();
            break;
        case 'chat':
            initializeChatPage();
            break;
        case 'tasks':
            initializeTasksPage();
            break;
        case 'resources':
            initializeResourcesPage();
            break;
    }
}

function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    return filename.replace('.html', '') || 'index';
}

// Page initialization functions
function initializeIndexPage() {
    // Add smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Animate stats on scroll
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        observer.observe(statsSection);
    }
}

function initializeLoginPage() {
    // Auto-fill remembered email
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const emailInput = document.getElementById('login-email');
    const rememberCheckbox = document.getElementById('remember-me');
    
    if (rememberedEmail && emailInput) {
        emailInput.value = rememberedEmail;
        if (rememberCheckbox) {
            rememberCheckbox.checked = true;
        }
    }
}

function initializeSignupPage() {
    // Real-time form validation
    setupRealTimeValidation();
}

function initializeTeamsPage() {
    // Check authentication
    if (!isAuthenticated()) {
        redirectToLogin();
        return;
    }
    
    // Load teams data
    loadTeamsData();
}

function initializeDashboardPage() {
    // Check authentication
    if (!isAuthenticated()) {
        redirectToLogin();
        return;
    }
    
    // Load dashboard data
    loadDashboardData();
}

function initializeChatPage() {
    // Check authentication
    if (!isAuthenticated()) {
        redirectToLogin();
        return;
    }
    
    // Load chat data
    loadChatData();
}

function initializeTasksPage() {
    // Check authentication
    if (!isAuthenticated()) {
        redirectToLogin();
        return;
    }
    
    // Load tasks data
    loadTasksData();
}

function initializeResourcesPage() {
    // Check authentication
    if (!isAuthenticated()) {
        redirectToLogin();
        return;
    }
    
    // Load resources data
    loadResourcesData();
}

// Utility functions
function isAuthenticated() {
    return localStorage.getItem('isLoggedIn') === 'true' && window.HackMate.currentUser;
}

function redirectToLogin() {
    window.location.href = 'login.html';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

function closeDropdowns(event) {
    // Close user menus and dropdowns when clicking outside
    const userMenu = document.getElementById('user-menu');
    if (userMenu && !event.target.closest('#user-menu') && !event.target.closest('[onclick*="showUserMenu"]')) {
        userMenu.style.display = 'none';
    }
}

function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const finalValue = stat.textContent;
        const numericValue = parseInt(finalValue.replace(/[^0-9]/g, ''));
        
        if (isNaN(numericValue)) return;
        
        let currentValue = 0;
        const increment = numericValue / 50;
        const isPercentage = finalValue.includes('%');
        const isPlus = finalValue.includes('+');
        const isK = finalValue.includes('k');
        
        const updateStat = () => {
            currentValue += increment;
            if (currentValue >= numericValue) {
                stat.textContent = finalValue;
            } else {
                let displayValue = Math.floor(currentValue);
                if (isK) {
                    stat.textContent = displayValue + 'k+';
                } else if (isPercentage) {
                    stat.textContent = displayValue + '%';
                } else if (isPlus) {
                    stat.textContent = displayValue + '+';
                } else {
                    stat.textContent = displayValue;
                }
                requestAnimationFrame(updateStat);
            }
        };
        
        updateStat();
    });
}

function setupRealTimeValidation() {
    // Email validation
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateEmail(this);
        });
    });
    
    // Password validation
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('input', function() {
            validatePassword(this);
        });
    });
}

function validateEmail(input) {
    const email = input.value.trim();
    const errorElement = input.parentNode.querySelector('.error-message');
    
    if (!email) {
        showInputError(input, 'Email is required');
        return false;
    } else if (!isValidEmail(email)) {
        showInputError(input, 'Please enter a valid email address');
        return false;
    } else {
        hideInputError(input);
        return true;
    }
}

function validatePassword(input) {
    const password = input.value;
    const errorElement = input.parentNode.querySelector('.error-message');
    
    if (!password) {
        showInputError(input, 'Password is required');
        return false;
    } else if (password.length < 6) {
        showInputError(input, 'Password must be at least 6 characters');
        return false;
    } else {
        hideInputError(input);
        return true;
    }
}

function showInputError(input, message) {
    let errorElement = input.parentNode.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.style.cssText = 'color: var(--destructive); font-size: 0.875rem; margin-top: 0.25rem;';
        input.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    input.style.borderColor = 'var(--destructive)';
}

function hideInputError(input) {
    const errorElement = input.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
    input.style.borderColor = 'var(--border)';
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Data loading functions
function loadTeamsData() {
    // This would be implemented in teams.html specific script
    console.log('Loading teams data...');
}

function loadDashboardData() {
    // This would be implemented in dashboard.html specific script
    console.log('Loading dashboard data...');
}

function loadChatData() {
    // This would be implemented in chat.html specific script
    console.log('Loading chat data...');
}

function loadTasksData() {
    // This would be implemented in tasks.html specific script
    console.log('Loading tasks data...');
}

function loadResourcesData() {
    // This would be implemented in resources.html specific script
    console.log('Loading resources data...');
}

// Enhanced toast notification system
function showToast(message, type = 'info', duration = 4000) {
    // Remove existing toasts of the same type
    document.querySelectorAll('.toast').forEach(toast => {
        if (toast.dataset.type === type) {
            toast.remove();
        }
    });
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.dataset.type = type;
    
    const colors = {
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6'
    };
    
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-family: inherit;
        font-size: 14px;
        max-width: 350px;
        word-wrap: break-word;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        white-space: pre-line;
        display: flex;
        align-items: start;
        gap: 8px;
    `;
    
    toast.innerHTML = `
        <span style="flex-shrink: 0; font-weight: bold;">${icons[type] || icons.info}</span>
        <span style="flex: 1;">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    });
    
    // Auto remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
    
    // Click to dismiss
    toast.addEventListener('click', function() {
        this.style.opacity = '0';
        this.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (this.parentNode) {
                this.parentNode.removeChild(this);
            }
        }, 300);
    });
}

// Enhanced local storage utilities
const Storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage error:', error);
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    },
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }
};

// Team utilities
const TeamUtils = {
    generateInviteCode() {
        const prefix = 'HACK2024';
        const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `${prefix}-${suffix}`;
    },
    
    createTeam(teamData) {
        const newTeam = {
            id: Date.now(),
            name: teamData.name,
            description: teamData.description || '',
            hackathon: teamData.hackathon,
            teamSize: teamData.teamSize || '4-5',
            category: teamData.category || '',
            createdBy: window.HackMate.currentUser?.email,
            createdAt: new Date().toISOString(),
            status: 'active',
            inviteCode: this.generateInviteCode(),
            members: [{
                id: window.HackMate.currentUser?.email,
                name: window.HackMate.currentUser?.name,
                email: window.HackMate.currentUser?.email,
                role: 'Team Leader',
                joinedAt: new Date().toISOString()
            }],
            tasks: [],
            resources: [],
            projects: []
        };
        
        return newTeam;
    },
    
    joinTeam(inviteCode) {
        // Simulate joining a team
        const newTeam = {
            id: Date.now(),
            name: "Demo Team",
            description: `Joined via invitation code: ${inviteCode}`,
            hackathon: "Global Hack Week 2024",
            teamSize: "4-5",
            category: "web",
            createdBy: "demo@example.com",
            createdAt: new Date().toISOString(),
            status: 'active',
            inviteCode: inviteCode,
            members: [{
                id: window.HackMate.currentUser?.email,
                name: window.HackMate.currentUser?.name,
                email: window.HackMate.currentUser?.email,
                role: 'Team Member',
                joinedAt: new Date().toISOString()
            }],
            tasks: [],
            resources: [],
            projects: []
        };
        
        return newTeam;
    }
};

// Form utilities
const FormUtils = {
    setLoading(buttonId, isLoading) {
        const btn = document.getElementById(buttonId);
        if (!btn) return;
        
        const textSpan = btn.querySelector('.btn-text');
        const loadingSpan = btn.querySelector('.btn-loading');
        
        if (isLoading) {
            btn.classList.add('loading');
            btn.disabled = true;
            if (textSpan) textSpan.style.display = 'none';
            if (loadingSpan) loadingSpan.style.display = 'inline-flex';
        } else {
            btn.classList.remove('loading');
            btn.disabled = false;
            if (textSpan) textSpan.style.display = 'inline-flex';
            if (loadingSpan) loadingSpan.style.display = 'none';
        }
    },
    
    validateForm(formElement) {
        const inputs = formElement.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                showInputError(input, `${input.labels[0]?.textContent || 'This field'} is required`);
                isValid = false;
            } else {
                hideInputError(input);
            }
        });
        
        return isValid;
    }
};

// Date utilities
const DateUtils = {
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },
    
    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
        if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
        
        return this.formatDate(dateString);
    }
};

// Export utilities to global scope
window.showToast = showToast;
window.Storage = Storage;
window.TeamUtils = TeamUtils;
window.FormUtils = FormUtils;
window.DateUtils = DateUtils;
window.isValidEmail = isValidEmail;

// Debug mode for development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.HackMate.debug = true;
    console.log('HackMate Debug Mode Enabled');
    
    // Add debug utilities
    window.HackMate.clearAllData = function() {
        Storage.clear();
        window.location.reload();
    };
    
    window.HackMate.createSampleData = function() {
        const sampleUser = {
            email: 'demo@hackmate.com',
            name: 'Demo User',
            teams: [
                TeamUtils.createTeam({
                    name: 'Awesome Hackers',
                    description: 'Building the next big thing',
                    hackathon: 'Global Hack Week 2024',
                    category: 'web'
                })
            ]
        };
        
        Storage.set('user', sampleUser);
        Storage.set('isLoggedIn', 'true');
        
        showToast('Sample data created! Refresh the page.', 'success');
    };
}

console.log('HackMate main.js loaded successfully');
