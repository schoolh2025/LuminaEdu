import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 🚨 APNI REAL CONFIGURATION CREDENTIALS KEYS YAHAN BIILKUL SAHI FILL KAREIN:
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

let selectedCategoryFilter = 'All';
let cachedJobsArray = [];
let layoutGridColumnsSetting = 'lg:grid-cols-3'; 
let globalImageVisibilitySetting = 'show'; 
let activeDynamicCategoriesList = [];

// IDENTITY FLOW NODES
window.registerNewUserNode = async function(email, password, fullname) {
    try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", credential.user.uid), { name: fullname, role: "Admin", email: email });
        window.spawnPremiumToastAlert("Success", "पंजीकरण सफल!", "success");
    } catch(err) { window.spawnPremiumToastAlert("Error", err.message, "error"); }
};

window.loginUserNode = async function(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.spawnPremiumToastAlert("Success", "लॉगिन सफल!", "success");
    } catch(err) { window.spawnPremiumToastAlert("Error", err.message, "error"); }
};

// FULL DYNAMIC CATEGORIES AND COLOR ENGINE
window.setJobFilter = function(categoryName) {
    selectedCategoryFilter = categoryName;
    renderDynamicCategoryChips();
    executeUIRenderPipeline();
};

function renderDynamicCategoryChips() {
    const box = document.getElementById('categoryFilterContainer');
    if(!box) return;

    box.innerHTML = activeDynamicCategoriesList.map(b => {
        let isActive = selectedCategoryFilter.toLowerCase() === b.name.toLowerCase();
        let currentCustomStyle = isActive 
            ? `background-color: ${b.hexColor || '#4f46e5'}; color: white; border-color: ${b.hexColor || '#4f46e5'}; box-shadow: 0 4px 12px rgba(0,0,0,0.1);`
            : `background-color: white; color: ${b.hexColor || '#1e293b'}; border-color: ${b.hexColor || '#cbd5e1'}20;`;

        return `<button onclick="window.setJobFilter('${b.name}')" style="${currentCustomStyle}" class="px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all duration-150">${b.name}</button>`;
    }).join('');
}

// MAIN CONTENT GENERATION CORE (FIXED DISCOVERY)
function executeUIRenderPipeline() {
    const feed = document.getElementById('publicCardsFeed');
    if(!feed) return;

    feed.className = `grid grid-cols-1 md:grid-cols-2 ${layoutGridColumnsSetting} gap-6`;

    // 🌟 FIX: Status filters applied carefully
    const filtered = cachedJobsArray.filter(j => {
        if(selectedCategoryFilter === 'All') return true;
        return j.type.toLowerCase() === selectedCategoryFilter.toLowerCase();
    });

    if(filtered.length === 0) {
        feed.innerHTML = `<div class="col-span-full text-center py-12 text-xs font-bold text-slate-400 bg-white/50 border border-dashed p-6 rounded-xl">इस श्रेणी में कोई पोस्ट उपलब्ध नहीं है।</div>`;
        return;
    }

    feed.innerHTML = filtered.map(j => {
        // Dynamic image hide/show according to admin preferences toggles
        let displayImg = "";
        if(globalImageVisibilitySetting === 'show' && j.imageUrls && j.imageUrls.length > 0) {
            displayImg = `<img src="${j.imageUrls[0]}" class="w-full h-40 object-cover rounded-xl mb-3 border border-slate-100" alt="Job Media">`;
        }

        // Search category background identity data color
        const catObj = activeDynamicCategoriesList.find(c => c.name.toLowerCase() === j.type.toLowerCase());
        let badgeColorHex = catObj ? catObj.hexColor : '#6366f1';

        return `
            <div class="premium-glass-card p-5 flex flex-col justify-between bg-white">
                <div>
                    ${displayImg}
                    <div class="flex justify-between items-center mb-2.5">
                        <span style="background-color: ${badgeColorHex}15; color: ${badgeColorHex}; border-color: ${badgeColorHex}30;" class="text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase border">${j.type}</span>
                        <span class="text-[11px] font-bold text-slate-400">📅 ${j.lastDate || 'Active'}</span>
                    </div>
                    <h3 class="font-extrabold text-slate-800 text-sm lg:text-base mb-1 leading-snug tracking-tight">${j.title}</h3>
                    <p class="text-[11px] text-slate-400 font-bold">🏛️ Board: ${j.authority}</p>
                </div>
                <button onclick="window.navigateToHub('detail', '${j.id}')" class="w-full bg-slate-50 hover:bg-indigo-50 border text-indigo-600 font-bold text-xs text-center py-2.5 rounded-xl mt-4 transition-all shadow-sm">
                    View Complete Details ↗
                </button>
            </div>
        `;
    }).join('');
}

// EXTANDED POST PREVIEW RENDER
window.renderPostDeepContentView = function(postId) {
    const targetPayloadBox = document.getElementById('detailViewContentPayload');
    const matchedPost = cachedJobsArray.find(item => item.id === postId);
    if(!matchedPost || !targetPayloadBox) return;
    
    targetPayloadBox.innerHTML = `
        <div class="space-y-4">
            <h2 class="text-xl lg:text-3xl font-black text-slate-900 leading-tight">${matchedPost.title}</h2>
            <p class="text-sm font-bold text-indigo-600">🏛️ Department/Board: ${matchedPost.authority}</p>
            <div class="bg-slate-50 p-4 rounded-xl border text-sm leading-relaxed whitespace-pre-wrap">${matchedPost.description || 'विवरण उपलब्ध नहीं है।'}</div>
            <div class="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs font-bold text-slate-600">
                <p>💰 Application Fee: ${matchedPost.feesDetails || 'Check Official Notification'}</p>
                <p class="mt-1">🎓 Eligibility Matrix: ${matchedPost.eligibility || 'Check Notification'}</p>
            </div>
        </div>
    `;
};

// DYNAMIC SYNC HOOKS LIFECYCLE
function startApplicationCoreEngine() {
    // 1. Fetch categories completely with custom dynamic color properties
    onSnapshot(collection(db, "categories"), (snapshot) => {
        activeDynamicCategoriesList = [{ id: 'all', name: 'All', hexColor: '#4f46e5' }];
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            activeDynamicCategoriesList.push({ id: docSnap.id, name: data.name, hexColor: data.hexColor || '#1e293b' });
        });
        renderDynamicCategoryChips();
    });

    // 2. Fetch system configurations (layout columns grid type, images logic)
    onSnapshot(doc(db, "app_settings", "grid_layout"), (docSnap) => {
        if(docSnap.exists()) {
            const d = docSnap.data();
            layoutGridColumnsSetting = d.columnsClass || 'lg:grid-cols-3';
            globalImageVisibilitySetting = d.imageVisibility || 'show';
        }
        executeUIRenderPipeline();
    });

    // 3. Sync posts loop
    onSnapshot(collection(db, "jobs"), (snapshot) => {
        cachedJobsArray = [];
        snapshot.forEach(docSnap => { cachedJobsArray.push({ id: docSnap.id, ...docSnap.data() }); });
        executeUIRenderPipeline();
    });
}

window.addEventListener('load', startApplicationCoreEngine);
window.executeUIRenderPipeline = executeUIRenderPipeline;
