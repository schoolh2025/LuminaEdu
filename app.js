import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 🚨 CRITICAL API KEY ERROR FIX: Kripya apni real credentials string bina kisi trailing spaces ke paste karein!
const firebaseConfig = {
    apiKey: "YOUR_REAL_FIREBASE_API_KEY_HERE",
    authDomain: "luminaedu-ai786.firebaseapp.com",
    projectId: "luminaedu-ai786",
    storageBucket: "luminaedu-ai786.appspot.com",
    messagingSenderId: "YOUR_REAL_SENDER_ID",
    appId: "YOUR_REAL_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

window.fbDB = db;

// USER IDENTITY FLOW PIPELINES
window.registerNewUserNode = async function(email, password, fullname) {
    if(!email || !password || !fullname) return alert("All fields are mandatory.");
    try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", credential.user.uid), { name: fullname, role: "UserContributor", email: email });
        alert("🎉 Registration successful! Redirecting to writing studio.");
        window.location.href = "dashboard/user.html";
    } catch(err) { alert("Registration Fault: " + err.message); }
};

window.loginUserNode = async function(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Access Verified. Launching Control Panels.");
        window.location.href = "dashboard/user.html";
    } catch(err) { alert("Access Denied: " + err.message); }
};

window.triggerForgotRecoveryNode = async function(email) {
    if(!email) return alert("Enter registered email in field below.");
    try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reconstruction matrix packet sent to email!");
    } catch(err) { alert(err.message); }
};

// GLOBAL BACKGROUND DATA SYNCHRONIZERS (Real-Time Listening)
if(document.getElementById('publicCardsFeed')) {
    onSnapshot(collection(db, "jobs"), (snapshot) => {
        const feed = document.getElementById('publicCardsFeed');
        feed.innerHTML = "";
        snapshot.forEach(docSnap => {
            const j = docSnap.data();
            // Strict Pipeline: Render only if approved by super admin
            if(j.approvalStatus === 'Live') {
                let targetPage = j.type === 'yojna' ? 'pages/yojna.html' : '#';
                feed.innerHTML += `
                    <div class="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/50 flex flex-col justify-between shadow-sm">
                        <div>
                            <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 uppercase">${j.type}</span>
                            <h3 class="font-bold text-slate-800 text-base mt-2 line-clamp-2">${j.title}</h3>
                            <p class="text-xs text-slate-500 font-semibold mt-1">🏛️ ${j.authority}</p>
                        </div>
                        <a href="${targetPage}?id=${docSnap.id}" class="w-full bg-indigo-600 text-white text-xs font-bold text-center py-2.5 rounded-xl mt-4 block hover:bg-indigo-700 transition-all">View Scheme Structure →</a>
                    </div>
                `;
            }
        });
    });
}
