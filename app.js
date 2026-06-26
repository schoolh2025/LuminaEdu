import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 🔥 APNI REAL FIREBASE WEB KEYS YAHAN EXACTLY FILL KAREIN:
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "luminaedu-ai786.firebaseapp.com",
    projectId: "luminaedu-ai786",
    storageBucket: "luminaedu-ai786.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Global State Caching System Environments
window.fbAuth = auth;
window.fbDB = db;

// UTILITY AUTHENTICATION CONTROL PIPELINES
window.registerNewUserNode = async function(email, password, fullname) {
    try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateDoc(doc(db, "users", credential.user.uid), { name: fullname, role: "UserContributor" });
        alert("Registration Complete! Welcome to LuminaEdu Portal System.");
        window.location.href = "dashboard/user.html";
    } catch(err) { alert("Registration Aborted: " + err.message); }
};

window.loginUserNode = async function(email, password) {
    try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        if(email === "admin@luminaedu.com" && password === "Admin@2026") {
            window.location.href = "dashboard/admin.html";
        } else {
            window.location.href = "dashboard/user.html";
        }
    } catch(err) { alert("Access Blocked: " + err.message); }
};

window.triggerForgotRecoveryNode = async function(email) {
    if(!email) return alert("Please enter email address field.");
    try {
        await sendPasswordResetEmail(auth, email);
        alert("Secure key recovery email dispatched successfully to your account destination.");
    } catch(err) { alert("Recovery Fault: " + err.message); }
};

window.logoutSessionNode = async function() {
    await signOut(auth);
    window.location.href = "../index.html";
};
