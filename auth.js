// auth.js

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYV3V0KhHjGcQhmH3Dsg9Se2PFOf5G0qY",
  authDomain: "hackmate-f9127.firebaseapp.com",
  projectId: "hackmate-fht mate-f9127",
  storageBucket: "hackmate-f9127.appspot.com",
  messagingSenderId: "617200538584",
  appId: "1:617200538584:web:0204c1ce29dbe8caf798ad",
  measurementId: "G-XDMK184368"
};

// Initialize Firebase using the 'compat' libraries for simplicity
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

/**
 * Handles the Google Sign-In process and saves the user to Firestore.
 */
function signInWithGoogle() {
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            const userProfile = {
                name: user.displayName,
                email: user.email,
                avatar: user.photoURL,
                uid: user.uid,
                joinedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            // Save user to the 'users' collection in Firestore
            return db.collection('users').doc(user.uid).set(userProfile, { merge: true });
        })
        .then(() => {
            window.location.href = 'dashboard.html'; // Redirect to dashboard
        })
        .catch((error) => {
            console.error("Sign-In Error:", error.message);
            alert("Error signing in: " + error.message);
        });
}

/**
 * Handles the Sign-Out process.
 */
function logout() {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error("Sign Out Error:", error);
    });
}

/**
 * Checks authentication state and protects pages.
 */
function checkAuthState() {
    const protectedPages = ['teams.html', 'profile.html', 'dashboard.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    auth.onAuthStateChanged(user => {
        if (!user && protectedPages.includes(currentPage)) {
            // If user is not logged in and is on a protected page, redirect to login
            window.location.href = 'login.html';
        }
    });
}


// Run the auth check on every page that includes this script
checkAuthState();


