import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// 🚨 APNI REAL CONFIGURATION CREDENTIALS KEYS YAHAN EXACT BINA SPACES KE FILL KAREIN:
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
const storage = getStorage(app);

window.fbDB = db;
window.fbStorage = storage;

let selectedCategoryFilter = 'All';
let cachedJobsArray = [];
let layoutGridColumnsSetting = 'lg:grid-cols-3'; 
let maxCardsToDisplayLimit = 6; 
let globalImageVisibilitySetting = 'show'; 

let activeDynamicCategoriesList = [
    { id: 'all', name: 'All', colorClass: 'bg-slate-800 text-slate-300 border-white/5' },
    { id: 'job', name: 'Job', colorClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { id: 'admit-card', name: 'Admit-Card', colorClass: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    { id: 'result', name: 'Result', colorClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { id: 'yojna', name: 'Yojna', colorClass: 'bg-green-500/10 text-green-400 border-green-500/20' },
    { id: 'scholarship', name: 'Scholarship', colorClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20' }
];

// ==========================================
// 🔐 PREMIUM IDENTITY ACCESSIBILITY PORTS
// ==========================================
window.registerNewUserNode = async function(email, password, fullname) {
    if(!email || !password || !fullname) return window.spawnPremiumToastAlert("Error", "सभी फ़ील्ड्स आवश्यक हैं।", "error");
    try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", credential.user.uid), { name: fullname, role: "UserContributor", email: email });
        window.spawnPremiumToastAlert("Success", "🎉 पंजीकरण सफल! योगदानकर्ता अकाउंट सक्रिय हो गया है।", "success");
        setTimeout(() => { window.location.href = "dashboard/user.html"; }, 2000);
    } catch(err) { window.spawnPremiumToastAlert("Authentication Error", err.message, "error"); }
};

window.loginUserNode = async function(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.spawnPremiumToastAlert("Access Granted", "🎉 लॉगिन सफल! डैशबोर्ड लोड हो रहा है...", "success");
        setTimeout(() => { window.location.href = "dashboard/user.html"; }, 1500);
    } catch(err) { window.spawnPremiumToastAlert("Authentication Denied", err.message, "error"); }
};

window.triggerForgotRecoveryNode = async function(email) {
    if(!email) return window.spawnPremiumToastAlert("Input Missing", "कृपया ईमेल दर्ज करें।", "error");
    try { 
        await sendPasswordResetEmail(auth, email); 
        window.spawnPremiumToastAlert("Email Dispatched", "पासवर्ड रीसेट लिंक भेज दिया गया है।", "success"); 
    } catch(err) { window.spawnPremiumToastAlert("Reset Error", err.message, "error"); }
};

// ==========================================
// 🎨 DYNAMIC MULTICOLOR CATEGORIES FILTER ENGINE
// ==========================================
window.setJobFilter = function(categoryName) {
    selectedCategoryFilter = categoryName;
    const mDropdown = document.getElementById('mobileCategorySelect');
    if(mDropdown) { mDropdown.value = categoryName; }
    renderMulticolorCategoryChips();
    executeUIRenderPipeline();
};

function renderMulticolorCategoryChips() {
    const box = document.getElementById('desktopCategoryChips');
    if(!box) return;
    
    box.innerHTML = activeDynamicCategoriesList.map(b => {
        let isActive = selectedCategoryFilter.toLowerCase() === b.name.toLowerCase();
        let targetStyle = isActive ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/30' : b.colorClass;
        return `<button onclick="window.setJobFilter('${b.name}')" class="px-4 py-2 text-xs md:text-sm font-extrabold rounded-xl border transition-all duration-200 ${targetStyle}">${b.name}</button>`;
    }).join('');
}

// ==========================================
// 🚀 MAIN PORTAL GRID CARDS RENDERING PIPELINE
// ==========================================
function executeUIRenderPipeline() {
    const feed = document.getElementById('publicCardsFeed');
    if(!feed) return; 

    feed.className = `grid grid-cols-1 md:grid-cols-2 ${layoutGridColumnsSetting} gap-8`;
    
    const filtered = cachedJobsArray.filter(j => {
        if(j.approvalStatus !== 'Live') return false;
        if(selectedCategoryFilter === 'All') return true;
        return j.type.toLowerCase() === selectedCategoryFilter.toLowerCase();
    });

    const limitedDataPool = filtered.slice(0, maxCardsToDisplayLimit);

    if(limitedDataPool.length === 0) {
        feed.innerHTML = `<div class="col-span-full text-center py-16 text-sm font-bold text-slate-400 bg-slate-900/40 border border-white/5 p-6 rounded-2xl shadow-sm">"${selectedCategoryFilter}" श्रेणी में कोई विज्ञापन सक्रिय नहीं है।</div>`;
        return;
    }

    feed.innerHTML = limitedDataPool.map(j => {
        let routeType = j.type.toLowerCase();
        let gridSpanProperty = (j.cardSizeLayout === 'featured') ? 'md:col-span-2 lg:col-span-2 border-l-4 border-l-indigo-500 shadow-md bg-gradient-to-tr from-[#111827] via-[#111827] to-[#1f2937]/30' : 'col-span-1';
        
        let displayImg = "";
        if(globalImageVisibilitySetting === 'show' && j.imageUrls && j.imageUrls.length > 0 && (j.imgDisplayLocation === 'both' || j.imgDisplayLocation === 'front')) {
            displayImg = `<img src="${j.imageUrls[0]}" class="w-full h-48 object-cover rounded-xl mb-4 border border-white/5 shadow-inner" alt="Banner">`;
        }

        return `
            <div class="premium-card neon-glow-card flex flex-col justify-between ${gridSpanProperty}">
                <div>
                    ${displayImg}
                    <div class="flex justify-between items-center mb-3">
                        <span class="text-xs font-extrabold px-3 py-1 rounded-full uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">${j.type}</span>
                        <span class="text-xs font-bold text-slate-400">📅 अंतिम तिथि: ${j.lastDate || 'सक्रिय'}</span>
                    </div>
                    <h3 class="font-extrabold text-white text-base md:text-lg mb-2 leading-snug tracking-tight">${j.title}</h3>
                    <p class="text-sm text-slate-400 font-bold">🏛️ बोर्ड: ${j.authority}</p>
                </div>
                <button onclick="window.navigateToHub('detail', '${j.id}')" class="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-bold text-center py-3 rounded-xl mt-5 block hover:from-indigo-500 hover:to-indigo-600 transition-all shadow-md">
                    विवरण एवं लिंक देखें →
                </button>
            </div>
        `;
    }).join('');
}

// ==========================================
// 📄 DEEP CONTENT RENDER ENGINE FOR SINGLE POST VIEW
// ==========================================
window.renderPostDeepContentView = function(postId) {
    const targetPayloadBox = document.getElementById('detailViewContentPayload');
    const matchedPost = cachedJobsArray.find(item => item.id === postId);
    
    if(!matchedPost || !targetPayloadBox) return;
    
    let postMediaImages = "";
    if(matchedPost.imageUrls && matchedPost.imageUrls.length > 0 && (matchedPost.imgDisplayLocation === 'post' || matchedPost.imgDisplayLocation === 'both')) {
        postMediaImages = matchedPost.imageUrls.map(url => `<img src="${url}" class="w-full max-h-[420px] object-cover rounded-2xl border border-white/5 my-6 shadow-2xl" alt="Media Asset">`).join('');
    }

    targetPayloadBox.innerHTML = `
        <div class="mt-4">
            <div class="flex justify-between items-center flex-wrap gap-2 border-b border-white/5 pb-4 mb-5">
                <span class="text-xs font-extrabold px-3 py-1 rounded-full uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">${matchedPost.type}</span>
                <span class="text-sm font-bold text-slate-400">📅 अंतिम तिथि (Last Date): <span class="text-emerald-400">${matchedPost.lastDate || 'सक्रिय'}</span></span>
            </div>
            
            <h2 class="text-2xl lg:text-4xl font-black text-white leading-tight tracking-tight">${matchedPost.title}</h2>
            <p class="text-indigo-400 font-bold text-sm lg:text-base mt-2">🏛️ आधिकारिक बोर्ड प्राधिकारी (Organization Board): ${matchedPost.authority}</p>
            
            ${postMediaImages}
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                <div class="bg-slate-900/60 p-5 rounded-2xl border border-white/5 text-sm">
                    <h4 class="font-extrabold text-base border-b border-white/5 pb-2 text-white flex items-center gap-1.5">💸 Application Fees Structures</h4>
                    <p class="mt-3 font-semibold text-slate-300 whitespace-pre-line leading-relaxed">${matchedPost.feesDetails || 'N/A (अधिसूचना देखें)'}</p>
                </div>
                <div class="bg-slate-900/60 p-5 rounded-2xl border border-white/5 text-sm">
                    <h4 class="font-extrabold text-base border-b border-white/5 pb-2 text-white flex items-center gap-1.5">🎓 Qualification & Eligibility Criteria</h4>
                    <p class="mt-3 font-semibold text-slate-300 whitespace-pre-line leading-relaxed">${matchedPost.eligibility || 'N/A (अधिसूचना देखें)'}</p>
                </div>
            </div>
        </div>
    `;
};

// ==========================================
// 📡 CORE LIFECYCLE INITIALIZATION LISTENERS
// ==========================================
function startApplicationCoreEngine() {
    // 1. Live Listen to dynamic Categories Block List from database collection
    if (document.getElementById('desktopCategoryChips')) {
        onSnapshot(collection(db, "categories"), (snapshot) => {
            if(!snapshot.empty) {
                activeDynamicCategoriesList = [{ id: 'all', name: 'All', colorClass: 'bg-slate-800 text-slate-300 border-white/5' }];
                snapshot.forEach(docSnap => {
                    activeDynamicCategoriesList.push({ id: docSnap.id, name: docSnap.data().name, colorClass: docSnap.data().colorClass || 'bg-slate-800 text-slate-300 border-white/5' });
                });
            }
            renderMulticolorCategoryChips();
        });
    }

    // 2. Live Listen to Global Layout Parameters Configurations
    onSnapshot(doc(db, "app_settings", "grid_layout"), (docSnap) => {
        if(docSnap.exists()) {
            const d = docSnap.data();
            layoutGridColumnsSetting = d.columnsClass || 'lg:grid-cols-3';
            maxCardsToDisplayLimit = d.maxLimitCards || 6;
            globalImageVisibilitySetting = d.imageVisibility || 'show';
        }
        executeUIRenderPipeline();
    }, (err) => { executeUIRenderPipeline(); });

    // 3. Live Listen to Main Active Posts Collection Storage Pipeline
    onSnapshot(collection(db, "jobs"), (snapshot) => {
        cachedJobsArray = [];
        snapshot.forEach(docSnap => { cachedJobsArray.push({ id: docSnap.id, ...docSnap.data() }); });
        executeUIRenderPipeline();
    });
}

window.addEventListener('load', startApplicationCoreEngine);
window.executeUIRenderPipeline = executeUIRenderPipeline;
