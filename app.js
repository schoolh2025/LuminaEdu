import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 🚨 FIREBASE CONNECTION CONNECTION MATRIX INITIALIZATION
// Kripya apni real backend configuration credentials strings yahan exact fill karein!
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
const auth = getAuth(app);

window.fbDB = db;
let selectedCategoryFilter = 'All';
let cachedJobsArray = [];

// ==========================================
// 🔐 USER MANAGEMENT IDENTITY PIPELINES
// ==========================================
window.registerNewUserNode = async function(email, password, fullname) {
    if(!email || !password || !fullname) return alert("सभी फ़ील्ड भरना अनिवार्य है।");
    try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", credential.user.uid), { name: fullname, role: "UserContributor", email: email });
        alert("🎉 पंजीकरण सफल! आपको कॉन्ट्रिब्यूटर राइटिंग स्टूडियो पर भेजा जा रहा है।");
        window.location.href = "dashboard/user.html";
    } catch(err) { alert("Registration Error: " + err.message); }
};

window.loginUserNode = async function(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("पहुंच सत्यापित! यूजर डैशबोर्ड लोड हो रहा है।");
        window.location.href = "dashboard/user.html";
    } catch(err) { alert("Access Denied: " + err.message); }
};

window.triggerForgotRecoveryNode = async function(email) {
    if(!email) return alert("कृपया अपना पंजीकृत ईमेल एड्रेस दर्ज करें।");
    try {
        await sendPasswordResetEmail(auth, email);
        alert("पासवर्ड रीमेपिंग लिंक आपके ईमेल पर सफलतापूर्वक भेज दिया गया है।");
    } catch(err) { alert(err.message); }
};

// ==========================================
// 🔀 MULTI-MODULE FILTER & TARGET ROUTING ENGINE
// ==========================================
window.setJobFilter = function(categoryName) {
    selectedCategoryFilter = categoryName;
    
    // Sync Mobile Dropdown element if it exists in the active DOM structure
    const mobileDropdown = document.getElementById('mobileCategoryDropdown');
    if(mobileDropdown) {
        mobileDropdown.value = categoryName;
    }
    
    executeUIRenderPipeline();
};

function executeUIRenderPipeline() {
    const feed = document.getElementById('publicCardsFeed');
    const sideTrend = document.getElementById('sidebarTrendingCluster');
    if(!feed) return;

    // Filtration evaluation constraint algorithms
    const filtered = cachedJobsArray.filter(j => {
        if(j.approvalStatus !== 'Live') return false;
        if(selectedCategoryFilter === 'All') return true;
        return j.type.toLowerCase() === selectedCategoryFilter.toLowerCase();
    });

    if(filtered.length === 0) {
        feed.innerHTML = `<div class="col-span-full text-center py-16 text-sm font-bold text-slate-500 bg-white/50 border p-6 rounded-2xl shadow-sm">"${selectedCategoryFilter}" श्रेणी में वर्तमान में कोई लाइव विज्ञापन सक्रिय नहीं है।</div>`;
        return;
    }

    // Dynamic card compiler mapping loops
    feed.innerHTML = filtered.map(j => {
        let routeType = j.type.toLowerCase();
        let targetPage = 'pages/job.html';
        if(routeType === 'yojna') targetPage = 'pages/yojna.html';
        else if(routeType === 'admit-card') targetPage = 'pages/admit-card.html';
        else if(routeType === 'result') targetPage = 'pages/result.html';
        else if(routeType === 'scholarship') targetPage = 'pages/scholarship.html';
        
        // 📐 Dynamic Grid structural property evaluation logic bounds
        let gridSpanProperty = (j.cardSizeLayout === 'featured') 
            ? 'md:col-span-2 lg:col-span-2 bg-gradient-to-tr from-white via-white to-slate-50/50' 
            : 'col-span-1 bg-white';
        
        let displayImg = (j.imageUrls && j.imageUrls.length > 0 && (j.imgDisplayLocation === 'both' || j.imgDisplayLocation === 'front')) 
            ? `<img src="${j.imageUrls[0]}" class="w-full h-48 object-cover rounded-xl mb-4 border border-slate-100 shadow-sm" alt="Banner Asset Grid">` : "";

        // 🎨 100% WORKING DYNAMIC COLOR CHIPS MAPPER LOGIC
        let badgeColorStyles = 'bg-slate-100 text-slate-700 border-slate-200';
        if(j.type === 'Job') badgeColorStyles = 'bg-blue-50 text-blue-700 border border-blue-100';
        else if(j.type === 'Admit-Card') badgeColorStyles = 'bg-orange-50 text-orange-700 border border-orange-100';
        else if(j.type === 'Result') badgeColorStyles = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
        else if(j.type === 'Yojna') badgeColorStyles = 'bg-green-50 text-green-700 border border-green-100';
        else if(j.type === 'Scholarship') badgeColorStyles = 'bg-purple-50 text-purple-700 border border-purple-100';

        return `
            <div class="premium-card flex flex-col justify-between ${gridSpanProperty}">
                <div>
                    ${displayImg}
                    <div class="flex justify-between items-center mb-3">
                        <span class="text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${badgeColorStyles}">${j.type}</span>
                        <span class="text-xs font-bold text-slate-500">📅 अंतिम तिथि: ${j.lastDate || 'सक्रिय'}</span>
                    </div>
                    <h3 class="font-extrabold text-slate-900 text-base md:text-lg leading-snug tracking-tight mb-2">${j.title}</h3>
                    <p class="text-sm text-slate-600 font-bold">🏛️ बोर्ड/संस्था: ${j.authority}</p>
                </div>
                <a href="${targetPage}?id=${j.id}" class="w-full bg-indigo-600 text-white text-sm font-bold text-center py-3 rounded-xl mt-4 block hover:bg-indigo-700 transition-all shadow-md tracking-wide">पूर्ण विवरण एवं लिंक देखें →</a>
            </div>
        `;
    }).join('');

    // Dynamic Updates Sidebar Content Streams Tracking Node Configuration
    if(sideTrend) {
        const trends = cachedJobsArray.filter(j => j.approvalStatus === 'Live').slice(0, 5);
        sideTrend.innerHTML = trends.map(t => {
            let rt = t.type.toLowerCase();
            let p = 'pages/job.html';
            if(rt === 'yojna') p = 'pages/yojna.html';
            else if(rt === 'admit-card') p = 'pages/admit-card.html';
            else if(rt === 'result') p = 'pages/result.html';
            else if(rt === 'scholarship') p = 'pages/scholarship.html';
            return `<a href="${p}?id=${t.id}" class="block hover:text-indigo-800 tracking-tight py-1.5 border-b border-dashed border-slate-200 font-bold text-slate-700">👉 ${t.title}</a>`;
        }).join('');
    }
}

// ==========================================
// 📡 SECURE MOUNT DATA LISTENERS CHANNELS (UPDATED & FIXED)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the main front page
    if(document.getElementById('publicCardsFeed')) {
        
        // Active Firestore Network Connection Channel
        onSnapshot(collection(db, "jobs"), (snapshot) => {
            cachedJobsArray = [];
            snapshot.forEach(docSnap => { 
                cachedJobsArray.push({ id: docSnap.id, ...docSnap.data() }); 
            });
            
            // 🔥 FIXED: Direct explicit calling of the UI pipeline matrix
            executeUIRenderPipeline();
        });
    }
});

// Windows binding to prevent isolation crashes
window.executeUIRenderPipeline = executeUIRenderPipeline;
