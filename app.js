import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 🚨 APNI REAL CONFIGURATION DETAILS PARAMETERS STRINGS BIILKUL SAHI FILL KAREIN:
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
let activeDynamicCategoriesList = [];
let layoutGridColumnsSetting = 'lg:grid-cols-3'; 
let maxCardsToDisplayLimit = 6; 
let globalImageVisibilitySetting = 'show'; 

// ==========================================
// 🔐 AUTH PIPELINES WIRED TO GLOBAL WINDOW
// ==========================================
window.registerNewUserNode = async function(email, password, fullname) {
    if(!email || !password || !fullname) return alert("सभी फ़ील्ड्स आवश्यक हैं।");
    try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", credential.user.uid), { name: fullname, role: "UserContributor", email: email });
        window.spawnPremiumToastAlert("Success", "🎉 पंजीकरण सफल! Workstation लोड हो रहा है।", "success");
        window.toggleAuthOverlay(false);
        window.performSinglePageRoutingView('contributor');
    } catch(err) { window.spawnPremiumToastAlert("Error", err.message, "error"); }
};

window.loginUserNode = async function(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.spawnPremiumToastAlert("Success", "🎉 लॉगिन सफल!", "success");
        window.toggleAuthOverlay(false);
        window.performSinglePageRoutingView('contributor');
    } catch(err) { window.spawnPremiumToastAlert("Error", err.message, "error"); }
};

window.executeForgotRecoveryPipeline = async function(email) {
    if(!email) return alert("कृपया ईमेल दर्ज करें।");
    try {
        await sendPasswordResetEmail(auth, email);
        window.spawnPremiumToastAlert("Dispatch Success", "🔑 पासवर्ड रीसेट लिंक ईमेल भेज दिया गया है।", "success");
        window.toggleAuthOverlay(false);
    } catch(err) { window.spawnPremiumToastAlert("Error", err.message, "error"); }
};

// ==========================================
// 🎨 CATEGORY CHIPS VISUAL BUILDER ENGINE
// ==========================================
window.setJobFilter = function(categoryName) {
    selectedCategoryFilter = categoryName;
    renderMulticolorCategoryChips();
    window.executeLiveSearchFiltering();
};

function renderMulticolorCategoryChips() {
    const box = document.getElementById('categoryFilterContainer');
    if(!box) return;
    box.innerHTML = activeDynamicCategoriesList.map(b => {
        let isActive = selectedCategoryFilter.toLowerCase() === b.name.toLowerCase();
        let targetStyle = isActive ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/30' : b.colorClass;
        return `<button onclick="window.setJobFilter('${b.name}')" class="px-4 py-2 text-xs font-bold rounded-xl border transition-all duration-150 tracking-wide ${targetStyle}">${b.name}</button>`;
    }).join('');
}

// ==========================================
// 🚀 UNIFIED FILTERING, SORTING & RENDERING PIPELINES
// ==========================================
window.executeLiveSearchFiltering = function() {
    const searchVal = document.getElementById('mainPortalSearchBox')?.value.trim().toLowerCase() || "";
    const sortVal = document.getElementById('mainPortalSortSelector')?.value || "newest";
    const feed = document.getElementById('publicCardsFeed');
    
    if(!feed) return; 

    // Task 1: Category Dynamic Filtering
    let dataset = cachedJobsArray.filter(j => {
        if(j.approvalStatus !== 'Live') return false;
        if(selectedCategoryFilter === 'All') return true;
        return j.type.toLowerCase() === selectedCategoryFilter.toLowerCase();
    });

    // Task 2: Keywords Search Filter
    if(searchVal) {
        dataset = dataset.filter(j => 
            j.title.toLowerCase().includes(searchVal) || 
            j.authority.toLowerCase().includes(searchVal)
        );
    }

    // Task 3: Sorting Matrix Evaluation
    if(sortVal === 'alpha') {
        dataset.sort((a, b) => a.title.localeCompare(b.title));
    } else if(sortVal === 'oldest') {
        dataset.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    } else {
        dataset.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }

    // Slice dataset for grid limits
    const limitedDataPool = dataset.slice(0, maxCardsToDisplayLimit);

    if(limitedDataPool.length === 0) {
        feed.innerHTML = `<div class="col-span-full text-center py-16 text-xs font-bold text-slate-400 bg-white/40 border border-dashed p-6 rounded-2xl shadow-inner">खोजे गए कीवर्ड या श्रेणी विन्यास अनुसार कोई लाइव रिकॉर्ड नहीं मिला।</div>`;
        return;
    }

    feed.className = `grid grid-cols-1 md:grid-cols-2 ${layoutGridColumnsSetting} gap-6`;
    feed.innerHTML = limitedDataPool.map(j => {
        let gridSpanProperty = (j.cardSizeLayout === 'featured') ? 'md:col-span-2 lg:col-span-2 border-l-4 border-l-indigo-500 bg-white' : 'col-span-1 bg-white';
        
        let displayImg = "";
        if(globalImageVisibilitySetting === 'show' && j.imageUrls && j.imageUrls.length > 0) {
            displayImg = `<img src="${j.imageUrls[0]}" class="w-full h-44 object-cover rounded-xl mb-3 border border-slate-100" alt="Card Banner">`;
        }

        const catObj = activeDynamicCategoriesList.find(c => c.name.toLowerCase() === j.type.toLowerCase());
        let badgeColorHex = catObj ? catObj.hexColor : '#6366f1';

        // ⭐ NEW CORE FEATURE: Dynamic 'NEW' blinking badge evaluation matrix channel
        let isNewAdvertisement = (Date.now() - (j.timestamp || 0)) < (2 * 24 * 60 * 60 * 1000); // 48 Hours threshold
        let newBadgeNode = isNewAdvertisement ? `<span class="new-blinking-badge text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 ml-2 tracking-wide">NEW</span>` : "";

        return `
            <div class="premium-card p-5 flex flex-col justify-between ${gridSpanProperty}">
                <div>
                    ${displayImg}
                    <div class="flex justify-between items-center mb-2.5">
                        <span style="background-color: ${badgeColorHex}12; color: ${badgeColorHex}; border-color: ${badgeColorHex}25;" class="text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase border tracking-wide">${j.type}</span>
                        <span class="text-[11px] font-bold text-slate-400 flex items-center gap-1">⏰ ${j.lastDate || 'Active'}</span>
                    </div>
                    <h3 class="font-extrabold text-slate-800 text-sm lg:text-base mb-1.5 leading-snug tracking-tight">${j.title} ${newBadgeNode}</h3>
                    <p class="text-xs text-slate-400 font-bold">🏛️ Board: ${j.authority}</p>
                </div>
                <button onclick="window.performSinglePageRoutingView('detail', '${j.id}')" class="w-full bg-slate-50 hover:bg-indigo-50 border border-slate-100 text-indigo-600 font-extrabold text-xs text-center py-2.5 rounded-xl mt-4 transition-all shadow-sm">
                    विवरण एवं लिंक देखें →
                </button>
            </div>
        `;
    }).join('');
}

// ==========================================
// 📑 RIGHT SIDEBAR & EXPANDED NODE RENDERING
// ==========================================
function renderRightSidebarRecommendedStack() {
    const sidebar = document.getElementById('rightSidebarRecommendedStack');
    if(!sidebar) return;

    // Filter live items for recommending inside stack
    const liveItems = cachedJobsArray.filter(j => j.approvalStatus === 'Live').slice(0, 5);
    
    if(liveItems.length === 0) {
        sidebar.innerHTML = `<p class="text-[11px] font-bold text-slate-400 text-center py-4">Recommendations Syncing...</p>`;
        return;
    }

    sidebar.innerHTML = liveItems.map(j => `
        <div onclick="window.performSinglePageRoutingView('detail', '${j.id}')" class="bg-white/50 hover:bg-white/90 p-3 rounded-xl border border-white/60 cursor-pointer transition-all text-xs flex flex-col gap-0.5 shadow-inner">
            <h4 class="font-bold text-slate-800 truncate leading-tight">${j.title}</h4>
            <span class="text-[9px] font-bold text-slate-400 uppercase">${j.authority || 'Issuing Authority'}</span>
        </div>
    `).join('');
}

window.renderPostDeepContentView = function(postId) {
    const targetPayloadBox = document.getElementById('detailViewContentPayload');
    const matchedPost = cachedJobsArray.find(item => item.id === postId);
    if(!matchedPost || !targetPayloadBox) return;
    
    targetPayloadBox.innerHTML = `
        <div class="mt-2 text-slate-800 space-y-4">
            <h2 class="text-xl lg:text-3xl font-black text-slate-900 leading-tight">${matchedPost.title}</h2>
            <p class="text-sm font-bold text-indigo-600">🏛️ Department Organization: ${matchedPost.authority}</p>
            <div class="bg-white/60 p-4 rounded-xl my-5 border text-sm leading-relaxed whitespace-pre-wrap">${matchedPost.description || 'विवरण के लिए आधिकारिक दस्तावेज देखें।'}</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-500 bg-slate-50 p-4 rounded-xl border">
                <div>💰 Application Fee Struct: ${matchedPost.feesDetails || 'Review Advertisement PDF'}</div>
                <div>🎓 Qualification Criteria: ${matchedPost.eligibility || 'Check Documentation Manual'}</div>
            </div>
        </div>
    `;
};

// ==========================================
// 👨‍💻 CONTRIBUTOR PROPOSAL INGESTION PIPELINE
// ==========================================
window.executeContributorPostSubmission = async function(e) {
    e.preventDefault();
    try {
        await addDoc(collection(db, "jobs"), {
            title: document.getElementById('cPostTitle').value.trim(),
            authority: document.getElementById('cPostAuth').value.trim(),
            type: document.getElementById('cPostType').value,
            lastDate: document.getElementById('cPostDate').value.trim(),
            approvalStatus: "Pending for Approval", // waiting for super admin confirmation
            timestamp: Date.now()
        });
        window.spawnPremiumToastAlert("Proposal Dispatch", "🎉 विज्ञापन समीक्षा हेतु कतार में भेज दिया गया है!", "success");
        e.target.reset();
    } catch(err) { window.spawnPremiumToastAlert("Error", err.message, "error"); }
};

// ==========================================
// 📡 APPLICATION EVENT CHANNELS LIFECYCLE
// ==========================================
function startApplicationCoreEngine() {
    // 🌟 ERROR-HANDLER: Prevent crashing on main categories loop dispatcher matrix
    try {
        onSnapshot(collection(db, "categories"), (snapshot) => {
            activeDynamicCategoriesList = [{ id: 'all', name: 'All', hexColor: '#4f46e5' }];
            snapshot.forEach(docSnap => {
                activeDynamicCategoriesList.push({ id: docSnap.id, name: docSnap.data().name, hexColor: docSnap.data().hexColor || '#1e293b' });
            });
            renderMulticolorCategoryChips();
            
            // Populate contributor form categories selection dropdown options
            const cSelect = document.getElementById('cPostType');
            if(cSelect) {
                cSelect.innerHTML = activeDynamicCategoriesList.filter(c => c.name !== 'All').map(c => `<option value="${c.name}">${c.name}</option>`).join('');
            }
        });
    } catch(e) { console.log("Category stream uninitialized matrix bypass engaged."); }

    // Synchronize global layout config parameters nodes schema
    onSnapshot(doc(db, "app_settings", "grid_layout"), (docSnap) => {
        if(docSnap.exists()) {
            const d = docSnap.data();
            layoutGridColumnsSetting = d.columnsClass || 'lg:grid-cols-3';
            maxCardsToDisplayLimit = d.maxLimitCards || 6;
            globalImageVisibilitySetting = d.imageVisibility || 'show';
        }
        window.executeLiveSearchFiltering();
    });

    // Synchronize core primary collection stream data payload matrix channels
    onSnapshot(collection(db, "jobs"), (snapshot) => {
        cachedJobsArray = [];
        snapshot.forEach(docSnap => { cachedJobsArray.push({ id: docSnap.id, ...docSnap.data() }); });
        window.executeLiveSearchFiltering();
        renderRightSidebarRecommendedStack();
    });
}

window.addEventListener('load', startApplicationCoreEngine);
window.executeLiveSearchFiltering = window.executeLiveSearchFiltering;
