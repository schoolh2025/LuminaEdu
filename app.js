import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 🔥 APNI REAL KEYS DHYAN SE FILL KAREIN:
const firebaseConfig = {
    apiKey: "YOUR_REAL_FIREBASE_API_KEY_HERE",
    authDomain: "luminaedu-ai786.firebaseapp.com",
    projectId: "luminaedu-ai786",
    storageBucket: "luminaedu-ai786.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

window.fbDB = db;
let selectedCategoryFilter = 'All';
let cachedJobsArray = [];

// USER MANAGEMENT PIPELINES
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
        alert("Access Verified. Launching User Panel.");
        window.location.href = "dashboard/user.html";
    } catch(err) { alert("Access Denied: " + err.message); }
};

window.triggerForgotRecoveryNode = async function(email) {
    if(!email) return alert("Enter registered email in field.");
    try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reconstruction packet sent to email!");
    } catch(err) { alert(err.message); }
};

// CATEGORY FILTER FILTER ENGINE BINDING
window.setJobFilter = function(categoryName) {
    selectedCategoryFilter = categoryName;
    executeUIRenderPipeline();
};

function executeUIRenderPipeline() {
    const feed = document.getElementById('publicCardsFeed');
    if(!feed) return;

    // Filter Logic Rules
    const filtered = cachedJobsArray.filter(j => {
        if(j.approvalStatus !== 'Live') return false;
        if(selectedCategoryFilter === 'All') return true;
        return j.type.toLowerCase() === selectedCategoryFilter.toLowerCase();
    });

    if(filtered.length === 0) {
        feed.innerHTML = `<div class="col-span-full text-center py-8 text-xs font-semibold text-slate-500">No active posts inside "${selectedCategoryFilter}" node cluster. Use Admin panel to add data.</div>`;
        return;
    }

    feed.innerHTML = filtered.map(j => {
        let isYojna = j.type.toLowerCase() === 'yojna';
        let targetPage = isYojna ? 'pages/yojna.html' : '#';
        let actionBtnText = isYojna ? 'View Scheme Structure →' : 'View Details & Apply →';
        
        return `
            <div class="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/50 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                <div>
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 uppercase border border-indigo-100">${j.type}</span>
                        <span class="text-[10px] font-bold text-slate-400">${j.lastDate || 'Active'}</span>
                    </div>
                    <h3 class="font-bold text-slate-800 text-base mt-2 line-clamp-2">${j.title}</h3>
                    <p class="text-xs text-slate-500 font-semibold mt-1">🏛️ ${j.authority}</p>
                </div>
                <a href="${targetPage}?id=${j.id}" class="w-full bg-indigo-600 text-white text-xs font-bold text-center py-2.5 rounded-xl mt-4 block hover:bg-indigo-700 transition-all shadow-sm">${actionBtnText}</a>
            </div>
        `;
    }).join('');
}

// REALTIME BACKEND SYNC OPERATIONS (Safe Mounting Execution)
document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('publicCardsFeed')) {
        // Render Filter Chips Node Structure Static Base
        const filterBox = document.getElementById('categoryFilterContainer');
        const coreCategories = ['All', 'Job', 'Admit Card', 'Result', 'Yojna', 'Scholarship'];
        if(filterBox) {
            filterBox.innerHTML = coreCategories.map(cat => `
                <button onclick="window.setJobFilter('${cat}')" class="px-3.5 py-1.5 text-xs font-bold rounded-full border bg-white/50 border-white/60 text-slate-600 hover:bg-white transition-all shadow-sm focus:bg-slate-800 focus:text-white">
                    ${cat}
                </button>
            `).join('');
        }

        // Active Firestore Network Connection Channel
        onSnapshot(collection(db, "jobs"), (snapshot) => {
            cachedJobsArray = [];
            snapshot.forEach(docSnap => {
                cachedJobsArray.push({ id: docSnap.id, ...docSnap.data() });
            });
            executeUIRenderPipeline();
        });
    }
});
