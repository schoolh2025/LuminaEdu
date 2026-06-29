import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js" ;
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// 🚨 PASTE YOUR ACCURATE WEB API KEY MATRIX VALUES STRINGS DIRECTLY HERE:
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
    { id: 'all', name: 'All', colorClass: 'bg-white text-slate-800 border-slate-200 shadow-sm font-bold' },
    { id: 'job', name: 'Job', colorClass: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200' },
    { id: 'admit-card', name: 'Admit-Card', colorClass: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200' },
    { id: 'result', name: 'Result', colorClass: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200' },
    { id: 'yojna', name: 'Yojna', colorClass: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200' },
    { id: 'scholarship', name: 'Scholarship', colorClass: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200' }
];

// AUTH CHANNELS
window.registerNewUserNode = async function(email, password, fullname) {
    if(!email || !password || !fullname) return window.spawnPremiumToastAlert("Error", "सभी फ़ील्ड्स आवश्यक हैं।", "error");
    try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", credential.user.uid), { name: fullname, role: "UserContributor", email: email });
        window.spawnPremiumToastAlert("Success", "🎉 पंजीकरण सफल!", "success");
        setTimeout(() => { window.location.href = "dashboard/user.html"; }, 2000);
    } catch(err) { window.spawnPremiumToastAlert("Error", err.message, "error"); }
};

window.loginUserNode = async function(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.spawnPremiumToastAlert("Access Granted", "🎉 लॉगिन सफल!", "success");
        setTimeout(() => { window.location.href = "dashboard/user.html"; }, 1500);
    } catch(err) { window.spawnPremiumToastAlert("Error", err.message, "error"); }
};

// CATEGORY FILTERS CHIPS CONTROLLER
window.setJobFilter = function(categoryName) {
    selectedCategoryFilter = categoryName;
    renderMulticolorCategoryChips();
    executeUIRenderPipeline();
};

function renderMulticolorCategoryChips() {
    const box = document.getElementById('categoryFilterContainer');
    if(!box) return;
    box.innerHTML = activeDynamicCategoriesList.map(b => {
        let isActive = selectedCategoryFilter.toLowerCase() === b.name.toLowerCase();
        let targetStyle = isActive ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-bold' : b.colorClass;
        return `<button onclick="window.setJobFilter('${b.name}')" class="px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all duration-150 ${targetStyle}">${b.name}</button>`;
    }).join('');
}

// MAIN RENDER TUNNEL
function executeUIRenderPipeline() {
    const feed = document.getElementById('publicCardsFeed');
    if(!feed) return;

    feed.className = `grid grid-cols-1 md:grid-cols-2 ${layoutGridColumnsSetting} gap-6`;
    const filtered = cachedJobsArray.filter(j => {
        if(j.approvalStatus !== 'Live') return false;
        if(selectedCategoryFilter === 'All') return true;
        return j.type.toLowerCase() === selectedCategoryFilter.toLowerCase();
    });

    const limitedDataPool = filtered.slice(0, maxCardsToDisplayLimit);

    if(limitedDataPool.length === 0) {
        feed.innerHTML = `<div class="col-span-full text-center py-12 text-xs font-bold text-slate-400 bg-white/40 border border-dashed p-6 rounded-2xl">"${selectedCategoryFilter}" श्रेणी में कोई सक्रिय पोस्ट नहीं है।</div>`;
        return;
    }

    feed.innerHTML = limitedDataPool.map(j => {
        let gridSpanProperty = (j.cardSizeLayout === 'featured') ? 'md:col-span-2 lg:col-span-2 border-l-4 border-l-indigo-500 bg-white' : 'col-span-1 bg-white';
        let displayImg = (globalImageVisibilitySetting === 'show' && j.imageUrls && j.imageUrls.length > 0 && (j.imgDisplayLocation === 'both' || j.imgDisplayLocation === 'front')) 
            ? `<img src="${j.imageUrls[0]}" class="w-full h-44 object-cover rounded-xl mb-3 border" alt="Banner">` : "";

        let badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
        if(j.type === 'Admit-Card') badgeStyle = 'bg-orange-50 text-orange-700 border-orange-200';
        else if(j.type === 'Result') badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        else if(j.type === 'Yojna') badgeStyle = 'bg-green-50 text-green-700 border-green-200';
        else if(j.type === 'Scholarship') badgeStyle = 'bg-purple-50 text-purple-700 border-purple-200';

        return `
            <div class="premium-glass-card p-5 flex flex-col justify-between ${gridSpanProperty}">
                <div>
                    ${displayImg}
                    <div class="flex justify-between items-center mb-2.5">
                        <span class="text-[11px] font-black px-2.5 py-0.5 rounded-md uppercase border ${badgeStyle}">${j.type}</span>
                        <span class="text-[11px] font-bold text-slate-400">📅 ${j.lastDate || 'Active'}</span>
                    </div>
                    <h3 class="font-extrabold text-slate-800 text-sm lg:text-base mb-1.5 leading-snug tracking-tight">${j.title}</h3>
                    <p class="text-xs text-slate-500 font-bold">🏛️ Board: ${j.authority}</p>
                </div>
                <button onclick="window.navigateToHub('detail', '${j.id}')" class="w-full bg-slate-50 hover:bg-indigo-50 border text-indigo-600 font-bold text-xs text-center py-2.5 rounded-xl mt-4 transition-all shadow-sm">
                    View Details ↗
                </button>
            </div>
        `;
    }).join('');
}

// DEEP CONTENT EXPANDER MODULE
window.renderPostDeepContentView = function(postId) {
    const targetPayloadBox = document.getElementById('detailViewContentPayload');
    const matchedPost = cachedJobsArray.find(item => item.id === postId);
    if(!matchedPost || !targetPayloadBox) return;
    
    targetPayloadBox.innerHTML = `
        <div class="mt-2 text-slate-800">
            <h2 class="text-xl lg:text-3xl font-black text-slate-900 leading-tight">${matchedPost.title}</h2>
            <p class="text-indigo-600 font-bold text-sm mt-1">🏛️ Organization: ${matchedPost.authority}</p>
            <div class="bg-white/60 p-4 rounded-xl my-5 border text-sm leading-relaxed">${matchedPost.feesDetails || 'विवरण के लिए आधिकारिक दस्तावेज देखें।'}</div>
        </div>
    `;
};

// INITIAL CORES START ENGINE LOGIC
function startApplicationCoreEngine() {
    renderMulticolorCategoryChips();

    // Sync layout configurations params document node schema
    onSnapshot(doc(db, "app_settings", "grid_layout"), (docSnap) => {
        if(docSnap.exists()) {
            const d = docSnap.data();
            layoutGridColumnsSetting = d.columnsClass || 'lg:grid-cols-3';
            maxCardsToDisplayLimit = d.maxLimitCards || 6;
            globalImageVisibilitySetting = d.imageVisibility || 'show';
        }
        executeUIRenderPipeline();
    }, (err) => { executeUIRenderPipeline(); });

    // Sync primary collection streams data payload
    onSnapshot(collection(db, "jobs"), (snapshot) => {
        cachedJobsArray = [];
        snapshot.forEach(docSnap => { cachedJobsArray.push({ id: docSnap.id, ...docSnap.data() }); });
        executeUIRenderPipeline();
    });
}

window.addEventListener('load', startApplicationCoreEngine);
window.executeUIRenderPipeline = executeUIRenderPipeline;
