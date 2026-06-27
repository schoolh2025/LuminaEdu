import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// 🚨 APNI REAL CONFIGURATION MATRIX VALUES KI STRINGS YAHAN DHYAN SE FILL KAREIN:
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
let globalImageVisibilitySetting = 'show'; // 'show' ya 'hide' global visibility parameter

// Default fallback categories block list map
let activeDynamicCategoriesList = [
    { id: 'all', name: 'All', colorClass: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' },
    { id: 'job', name: 'Job', colorClass: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200' },
    { id: 'admit-card', name: 'Admit-Card', colorClass: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200' },
    { id: 'result', name: 'Result', colorClass: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' },
    { id: 'yojna', name: 'Yojna', colorClass: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200' },
    { id: 'scholarship', name: 'Scholarship', colorClass: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200' }
];

// ==========================================
// 🎨 DYNAMIC MULTICOLOR CATEGORIES BUILDER
// ==========================================
window.setJobFilter = function(categoryName) {
    selectedCategoryFilter = categoryName;
    const mDropdown = document.getElementById('mobileCategoryDropdown');
    if(mDropdown) { mDropdown.value = categoryName; }
    renderMulticolorCategoryChips();
    executeUIRenderPipeline();
};

function renderMulticolorCategoryChips() {
    const box = document.getElementById('categoryFilterContainer');
    if(!box) return;
    
    box.innerHTML = activeDynamicCategoriesList.map(b => {
        let isActive = selectedCategoryFilter.toLowerCase() === b.name.toLowerCase();
        let targetStyle = isActive ? 'bg-slate-900 text-white border-slate-900 shadow-md' : b.colorClass;
        return `<button onclick="window.setJobFilter('${b.name}')" class="px-4 py-2 text-xs md:text-sm font-extrabold rounded-xl border transition-all duration-200 ${targetStyle}">${b.name}</button>`;
    }).join('');
}

// ==========================================
// 🚀 MAIN PORTAL UI DATA RENDER RENDERING ENGINE
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
        feed.innerHTML = `<div class="col-span-full text-center py-16 text-sm font-bold text-slate-500 bg-white/60 border p-6 rounded-2xl shadow-sm">"${selectedCategoryFilter}" श्रेणी में कोई विज्ञापन सक्रिय नहीं है।</div>`;
        return;
    }

    feed.innerHTML = limitedDataPool.map(j => {
        let routeType = j.type.toLowerCase();
        let targetPage = 'pages/job.html';
        if(routeType === 'yojna') targetPage = 'pages/yojna.html';
        else if(routeType === 'admit-card') targetPage = 'pages/admit-card.html';
        else if(routeType === 'result') targetPage = 'pages/result.html';
        else if(routeType === 'scholarship') targetPage = 'pages/scholarship.html';
        
        let gridSpanProperty = (j.cardSizeLayout === 'featured') ? 'md:col-span-2 lg:col-span-2 border-l-4 border-l-indigo-600' : 'col-span-1';
        
        // 🖼️ Admin Config Global Rule: Hide/Show image evaluation conditional
        let displayImg = "";
        if(globalImageVisibilitySetting === 'show' && j.imageUrls && j.imageUrls.length > 0 && (j.imgDisplayLocation === 'both' || j.imgDisplayLocation === 'front')) {
            displayImg = `<img src="${j.imageUrls[0]}" class="w-full h-48 object-cover rounded-xl mb-4 border border-slate-100" alt="Banner">`;
        }

        return `
            <div class="premium-card flex flex-col justify-between ${gridSpanProperty}">
                <div>
                    ${displayImg}
                    <div class="flex justify-between items-center mb-3">
                        <span class="text-xs font-extrabold px-3 py-1 rounded-full uppercase border bg-indigo-50 text-indigo-700">${j.type}</span>
                        <span class="text-xs font-bold text-slate-500">📅 अंतिम तिथि: ${j.lastDate || 'सक्रिय'}</span>
                    </div>
                    <h3 class="font-extrabold text-slate-900 text-base md:text-lg mb-2">${j.title}</h3>
                    <p class="text-sm text-slate-600 font-bold">🏛️ बोर्ड: ${j.authority}</p>
                </div>
                <a href="${targetPage}?id=${j.id}" class="w-full bg-indigo-600 text-white text-sm font-bold text-center py-3 rounded-xl mt-4 block hover:bg-indigo-700 transition-all shadow-md">विवरण एवं लिंक देखें →</a>
            </div>
        `;
    }).join('');
}

// ==========================================
// 📡 REALTIME DOM MOUNT CONNECTORS LOGIC CHANNELS
// ==========================================
function startApplicationCoreEngine() {
    if(!document.getElementById('publicCardsFeed')) return;

    // Realtime Sync for Categories block list array mapping setup
    onSnapshot(collection(db, "categories"), (snapshot) => {
        if(!snapshot.empty) {
            activeDynamicCategoriesList = [{ id: 'all', name: 'All', colorClass: 'bg-slate-100 text-slate-700 border-slate-200' }];
            snapshot.forEach(docSnap => {
                activeDynamicCategoriesList.push({ id: docSnap.id, name: docSnap.data().name, colorClass: docSnap.data().colorClass || 'bg-slate-50 text-slate-700 border-slate-200' });
            });
        }
        renderMulticolorCategoryChips();
    });

    // Realtime Sync for global grid settings parameters mapping metadata layout
    onSnapshot(doc(db, "app_settings", "grid_layout"), (docSnap) => {
        if(docSnap.exists()) {
            const d = docSnap.data();
            layoutGridColumnsSetting = d.columnsClass || 'lg:grid-cols-3';
            maxCardsToDisplayLimit = d.maxLimitCards || 6;
            globalImageVisibilitySetting = d.imageVisibility || 'show';
        }
        executeUIRenderPipeline();
    }, (err) => {
        executeUIRenderPipeline();
    });

    // Realtime Stream connection matrix tracker channel payload loop
    onSnapshot(collection(db, "jobs"), (snapshot) => {
        cachedJobsArray = [];
        snapshot.forEach(docSnap => { cachedJobsArray.push({ id: docSnap.id, ...docSnap.data() }); });
        executeUIRenderPipeline();
    });
}

window.addEventListener('load', startApplicationCoreEngine);
window.executeUIRenderPipeline = executeUIRenderPipeline;
