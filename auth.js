// auth.js

// Import necessary modular Firebase functions
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js'; // Use current modular CDN version
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    GithubAuthProvider, 
    signInWithPopup, 
    sendPasswordResetEmail 
} from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js'; // Use current modular CDN version
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js'; // Use current modular CDN version


// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYV3V0KhHjGcQhmH3Dsg9Se2PFOf5G0qY",
  authDomain: "hackmate-f9127.firebaseapp.com",
  projectId: "hackmate-f9127",
  storageBucket: "hackmate-f9127.appspot.com",
  messagingSenderId: "617200538584",
  appId: "1:617200538584:web:0204c1ce29dbe8caf798ad",
  measurementId: "G-XDMK184368"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app); // If you're using Firestore

// --- Login Form Submission ---
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        document.getElementById('login-btn').classList.add('loading');
        // Use the modular function for sign-in
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'teams.html'; // Redirect on success
    } catch (error) {
        document.getElementById('login-btn').classList.remove('loading');
        // Clear previous errors
        document.getElementById('email-error').style.display = 'none';
        document.getElementById('password-error').style.display = 'none';

        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
            document.getElementById('email-error').textContent = 'No user found with this email or invalid format.';
            document.getElementById('email-error').style.display = 'block';
        } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') { // 'invalid-credential' is a more generic error for wrong username/password since v9
            document.getElementById('password-error').textContent = 'Incorrect password.';
            document.getElementById('password-error').style.display = 'block';
        } else {
            console.error("Login error:", error);
            alert(`Login failed: ${error.message}`);
        }
    }
});

// --- Toggle password visibility ---
document.getElementById('toggle-password').addEventListener('click', () => {
    const passwordInput = document.getElementById('login-password');
    const toggleButton = document.getElementById('toggle-password');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.innerHTML = '<i data-lucide="eye-off" style="width: 1rem; height: 1rem;"></i>';
    } else {
        passwordInput.type = 'password';
        toggleButton.innerHTML = '<i data-lucide="eye" style="width: 1rem; height: 1rem;"></i>';
    }
    // Re-create Lucide icons if dynamically added/changed
    lucide.createIcons(); 
});


// --- Social Sign-in Functions (Modular style) ---
// Make these functions globally accessible so HTML `onclick` can call them.
// This is done by attaching them to the window object or by directly handling events in auth.js.
// For simplicity with your current HTML, window attachment is shown, but direct event listeners are often cleaner.

window.signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        window.location.href = 'teams.html';
    } catch (error) {
        console.error("Google Sign-in error:", error);
        alert(`Google Sign-in failed: ${error.message}`);
    }
};

window.signInWithGitHub = async () => {
    const provider = new GithubAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        window.location.href = 'teams.html';
    } catch (error) {
        console.error("GitHub Sign-in error:", error);
        alert(`GitHub Sign-in failed: ${error.message}`);
    }
};

// --- Forgot Password Modal Functions ---
window.showForgotPasswordModal = () => {
    document.getElementById('forgot-password-modal').style.display = 'block';
};

window.hideForgotPasswordModal = () => {
    document.getElementById('forgot-password-modal').style.display = 'none';
};

document.getElementById('forgot-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('reset-email').value;
    try {
        await sendPasswordResetEmail(auth, email);
        alert('Password reset link sent to your email!');
        hideForgotPasswordModal();
    } catch (error) {
        console.error("Password reset error:", error);
        alert(`Failed to send reset email: ${error.message}`);
    }
});
