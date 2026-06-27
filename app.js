import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 🔥 FIREBASE STABLE MODULE PARAMS INITIALIZATION
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
let layoutGridColumnsSetting = 'lg:grid-cols-3'; // Default fallback grid structure
let maxCardsToDisplayLimit = 6; // Default fallback row display limitation bounds

// ==========================================
// 🔐 AUTH OPERATIONS CONNECTORS PIPELINES
// ==========================================
window.registerNewUserNode = async function(email, password, fullname) {
    if(!email || !password || !fullname) return alert("सभी फ़ील्ड्स भरना अनिवार्य है।");
    try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", credential.user.uid), { name: fullname, role: "UserContributor", email: email });
        alert("🎉 रजिस्ट्रेशन सफल! स्टूडियो राइटिंग बोर्ड लोड हो रहा है।");
        window.location.href = "dashboard/user.html";
    } catch(err) { alert(err.message); }
};

window.loginUserNode = async function(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("एक्सेस स्वीकृत!"); window.location.href = "dashboard/user.html";
    } catch(err) { alert("Access Denied: " + err.message); }
};

window.triggerForgotRecoveryNode = async function(email) {
    if(!email) return alert("कृपया ईमेल पता दर्ज करें।");
    try { await sendPasswordResetEmail(auth, email); alert("रीसेट लिंक ईमेल भेज दिया गया है।"); } catch(err) { alert(err.message); }
};

// ==========================================
// 🎨 DYNAMIC MULTICOLOR CATEGORIES ENGINE CONFIG
// ==========================================
const buttonStyles = [
    { name: 'All', active: 'bg-slate-900 text-white border-slate-900', inactive: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' },
    { name: 'Job', active: 'bg-blue-600 text-white border-blue-600 shadow-md', inactive: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200' },
    { name: 'Admit-Card', active: 'bg-orange-600 text-white border-orange-600 shadow-md', inactive: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200' },
    { name: 'Result', active: 'bg-emerald-600 text-white border-emerald-600 shadow-md', inactive: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' },
    { name: 'Yojna', active: 'bg-green-600 text-white border-green-600 shadow-md', inactive: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200' },
    { name: 'Scholarship', active: 'bg-purple-600 text-white border-purple-600 shadow-md', inactive: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200' }
];

window.setJobFilter = function(categoryName) {
    selectedCategoryFilter = categoryName;
    
    // Sync Mobile Dropdown Selector values element to avoid clashing
    const mDropdown = document.getElementById('mobileCategoryDropdown');
    if(mDropdown) { mDropdown.value = categoryName; }

    renderMulticolorCategoryChips();
    executeUIRenderPipeline();
};

function renderMulticolorCategoryChips() {
    const box = document.getElementById('categoryFilterContainer');
    if(!box) return; // Guard clause to prevent rendering errors on sub-pages
    
    box.innerHTML = buttonStyles.map(b => {
        let isActive = selectedCategoryFilter.toLowerCase() === b.name.toLowerCase();
        let targetClass = isActive ? b.active : b.inactive;
        return `<button onclick="window.setJobFilter('${b.name}')" class="px-4 py-2 text-xs md:text-sm font-extrabold rounded-xl border transition-all duration-200 tracking-wide ${targetClass}">${b.name}</button>`;
    }).join('');
}

// ==========================================
// 🚀 RENDERING USER INTERFACE DATA CORE PIPELINE
// ==========================================
function executeUIRenderPipeline() {
    const feed = document.getElementById('publicCardsFeed');
    if(!feed) return;

    // Apply layout density selectors rules classes directly from database properties stream values
    feed.className = `grid grid-cols-1 md:grid-cols-2 ${layoutGridColumnsSetting} gap-8`;

    const filtered = cachedJobsArray.filter(j => {
        if(j.approvalStatus !== 'Live') return false;
        if(selectedCategoryFilter === 'All') return true;
        return j.type.toLowerCase() === selectedCategoryFilter.toLowerCase();
    });

    // Slicing arrays to respect admin row density controller settings
    const limitedDataPool = filtered.slice(0, maxCardsToDisplayLimit);

    if(limitedDataPool.length === 0) {
        feed.innerHTML = `<div class="col-span-full text-center py-16 text-sm font-bold text-slate-500 bg-white/60 border p-6 rounded-2xl shadow-sm">"${selectedCategoryFilter}" श्रेणी में वर्तमान में कोई लाइव विज्ञापन सक्रिय नहीं है।</div>`;
        return;
    }

    feed.innerHTML = limitedDataPool.map(j => {
        let routeType = j.type.toLowerCase();
        let targetPage = 'pages/job.html';
        if(routeType === 'yojna') targetPage = 'pages/yojna.html';
        else if(routeType === 'admit-card') targetPage = 'pages/admit-card.html';
        else if(routeType === 'result') targetPage = 'pages/result.html';
        else if(routeType === 'scholarship') targetPage = 'pages/scholarship.html';
        
        // Single card span layout logic matrix configuration
        let gridSpanProperty = (j.cardSizeLayout === 'featured') 
            ? 'md:col-span-2 lg:col-span-2 bg-gradient-to-tr from-white via-white to-slate-50/50 border-l-4 border-l-indigo-600' 
            : 'col-span-1 bg-white';
        
        let displayImg = (j.imageUrls && j.imageUrls.length > 0 && (j.imgDisplayLocation === 'both' || j.imgDisplayLocation === 'front')) 
            ? `<img src="${j.imageUrls[0]}" class="w-full h-48 object-cover rounded-xl mb-4 border border-slate-100 shadow-sm" alt="Banner">` : "";

        let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
        if(j.type === 'Job') badgeStyle = 'bg-blue-50 text-blue-700 border border-blue-100';
        else if(j.type === 'Admit-Card') badgeStyle = 'bg-orange-50 text-orange-700 border border-orange-100';
        else if(j.type === 'Result') badgeStyle = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
        else if(j.type === 'Yojna') badgeStyle = 'bg-green-50 text-green-700 border border-green-100';
        else if(j.type === 'Scholarship') badgeStyle = 'bg-purple-50 text-purple-700 border border-purple-100';

        return `
            <div class="premium-card flex flex-col justify-between ${gridSpanProperty}">
                <div>
                    ${displayImg}
                    <div class="flex justify-between items-center mb-3">
                        <span class="text-xs font-extrabold px-3 py-1 rounded-full uppercase border ${badgeStyle}">${j.type}</span>
                        <span class="text-xs font-bold text-slate-500">📅 अंतिम तिथि: ${j.lastDate || 'सक्रिय'}</span>
                    </div>
                    <h3 class="font-extrabold text-slate-900 text-base md:text-lg leading-snug tracking-tight mb-2">${j.title}</h3>
                    <p class="text-sm text-slate-600 font-bold">🏛️ बोर्ड: ${j.authority}</p>
                </div>
                <a href="${targetPage}?id=${j.id}" class="w-full bg-indigo-600 text-white text-sm font-bold text-center py-3 rounded-xl mt-4 block hover:bg-indigo-700 transition-all shadow-md">विवरण एवं लिंक देखें →</a>
            </div>
        `;
    }).join('');
}

// ==========================================
// 📡 ASYNC INITIAL DOM CHANNEL SETUP LISTENERS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('publicCardsFeed')) {
        renderMulticolorCategoryChips();

        // Safe dynamic listener maps custom grid configurations values from cloud server nodes
        onSnapshot(doc(db, "app_settings", "grid_layout"), (docSnap) => {
            if(docSnap.exists()) {
                const d = docSnap.data();
                layoutGridColumnsSetting = d.columnsClass || 'lg:grid-cols-3';
                maxCardsToDisplayLimit = d.maxLimitCards || 6;
            }
            executeUIRenderPipeline();
        }, (error) => {
            console.log("Settings cluster uninitialized or locked. Fallback parameters engaged.");
            executeUIRenderPipeline();
        });

        // Realtime main loop network stream channels data pull execution
        onSnapshot(collection(db, "jobs"), (snapshot) => {
            cachedJobsArray = [];
            snapshot.forEach(docSnap => { cachedJobsArray.push({ id: docSnap.id, ...docSnap.data() }); });
            executeUIRenderPipeline();
        });
    }
});

window.executeUIRenderPipeline = executeUIRenderPipeline;
