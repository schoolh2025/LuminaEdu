import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, setDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDEXmjIN8w2s2uXk0FTzC7ri4HhLetzV4E",
  authDomain: "luminaedu-ai786.firebaseapp.com",
  projectId: "luminaedu-ai786",
  storageBucket: "luminaedu-ai786.firebasestorage.app",
  messagingSenderId: "35041307389",
  appId: "1:35041307389:web:846f981017df7ad1382c94"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Registration Process
const regBtn = document.getElementById('registerBtn');
if(regBtn) {
    regBtn.addEventListener('click', async () => {
        const pass = document.getElementById('regPassKey').value.trim();
        if(!pass) return alert("Password khali nahi chhod sakte!");
        try {
            await setDoc(doc(collection(db, "user_registry")), { password: pass });
            alert("Registration Successful! Ab login kijiye.");
            window.location.href = "login.html";
        } catch(e) { alert(e.message); }
    });
}

// Login Process
const logBtn = document.getElementById('loginBtn');
if(logBtn) {
    logBtn.addEventListener('click', async () => {
        const entered = document.getElementById('userPassKey').value.trim();
        if(!entered) return;
        
        if(entered === "LuminaUser@2026") { // Universal master backup bypass
            sessionStorage.setItem("user_token", "verified_user");
            window.location.href = "dashboard.html";
            return;
        }

        try {
            const snap = await getDocs(collection(db, "user_registry"));
            let matched = false;
            snap.forEach(d => { if(d.data().password === entered) matched = true; });
            
            if(matched) {
                sessionStorage.setItem("user_token", "verified_user");
                window.location.href = "dashboard.html";
            } else { alert("❌ Galat Password!"); }
        } catch(e) { alert(e.message); }
    });
}

// Dashboard Security Lock Verification
if(window.location.pathname.includes("dashboard.html")) {
    if(sessionStorage.getItem("user_token") !== "verified_user") {
        window.location.replace("login.html");
    }
}

// Submit Proposal Post
const proposalBtn = document.getElementById('submitProposalBtn');
if(proposalBtn) {
    proposalBtn.addEventListener('click', async () => {
        const payload = {
            title: document.getElementById('pTitle').value.trim(),
            authority: document.getElementById('pAuth').value.trim(),
            type: document.getElementById('pType').value.trim(),
            lastDate: document.getElementById('pLastDate').value.trim(),
            approvalStatus: "Pending",
            timestamp: Date.now()
        };
        if(!payload.title) return alert("Title daalna jaroori hai!");
        try {
            await addDoc(collection(db, "jobs"), payload);
            alert("🚀 Proposal Admin Queue me bhej diya gaya hai!");
            document.getElementById('pTitle').value = ""; document.getElementById('pAuth').value = "";
        } catch(e) { alert(e.message); }
    });
}

// Logout Engine
const outBtn = document.getElementById('userLogoutBtn');
if(outBtn) {
    outBtn.addEventListener('click', () => {
        sessionStorage.clear();
        window.location.replace("../index.html");
    });
}
