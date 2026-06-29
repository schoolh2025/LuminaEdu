import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 🚨 APNI REAL CONFIGURATION VALUES KI STRINGS PARAMETERS YAHAN FILL KAREIN EXACT:
const firebaseConfig = {
    apiKey: "YOUR_REAL_API_KEY_HERE",
    authDomain: "luminaedu-ai786.firebaseapp.com",
    projectId: "luminaedu-ai786",
    storageBucket: "luminaedu-ai786.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
    appId: "YOUR_APP_ID_HERE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

window.fbDB = db;
let selectedCategoryFilter = 'All';
let cachedJobsArray = [];
let activeDynamicCategoriesList = [];
let layoutGridColumnsSetting = 'lg:grid-cols-3'; 
let globalImageVisibilitySetting = 'show'; 

// ==========================================
// 🔐 SECURE GLOBAL CORE IDENTITY GATEWAYS
// ==========================================
window.registerNewUserNode = async function(email, password, fullname) {
    if(!email || !password || !fullname) return window.spawnPremiumToastAlert("Validation Error", "सभी फ़ील्ड्स भरना अनिवार्य है।", "error");
    try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", credential.user.uid), { name: fullname, role: "UserContributor", email: email });
        window.spawnPremiumToastAlert("Access Created", "🎉 पंजीकरण सफल! वर्कस्पेस मोड ऑन हो रहा है।", "success");
        window.toggleAuthOverlay(false);
        window.navigateToHub('contributor'); // Bypasses folder crashes redirecting inside dynamic Single-Page DOM layouts
    } catch(err) { window.spawnPremiumToastAlert("Registration Refused", err.message, "error"); }
};

window.loginUserNode = async function(email, password) {
    if(!email || !password) return window.spawnPremiumToastAlert("Validation Error", "ईमेल और पासवर्ड दर्ज करें।", "error");
    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.spawnPremiumToastAlert("Access Granted", "🎉 लॉगिन सफल! वर्कस्पेस लोड हो रहा है...", "success");
        window.toggleAuthOverlay(false);
        window.navigateToHub('contributor');
    } catch(err) { window.spawnPremiumToastAlert("Access Denied", err.message, "error"); }
};

window.executeForgotRemainingPipeline = async function(email) {
    if(!email) return window.spawnPremiumToastAlert("Input Missing", "कृपया ईमेल दर्ज करें।", "error");
    try {
        await sendPasswordResetEmail(auth, email);
        window.spawnPremiumToastAlert("Email Dispatched", "🔑 पासवर्ड रीसेट लिंक आपके ईमेल पर भेज दिया गया है।", "success");
        window.toggleForgotPasswordViewMode(false);
        window.toggleAuthOverlay(false);
    } catch(err) { window.spawnPremiumToastAlert("Recovery Failure", err.message, "error"); }
};

// ==========================================
// 🎨 DYNAMIC DUAL VIEWS CATEGORIES CHIPS BUILDERS
// ==========================================
window.setJobFilter = function(categoryName) {
    selectedCategoryFilter = categoryName;
    renderDynamicChipsLayout();
    window.executeLiveSearchFiltering();
};

function renderDynamicChipsLayout() {
    const box = document.getElementById('categoryFilterContainer');
    if(!box) return;

    box.innerHTML = activeDynamicCategoriesList.map(b => {
        let isActive = selectedCategoryFilter.toLowerCase() === b.name.toLowerCase();
        let currentCustomStyle = isActive 
            ? `background-color: ${b.hexColor || '#4f46e5'}; color: white; border-color: ${b.hexColor || '#4f46e5'}; font-weight: 800; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);`
            : `background-color: rgba(255,255,255,0.9); color: #1e293b; border-color: rgba(226,232,240,0.8); font-weight: 700;`;

        return `<button onclick="window.setJobFilter('${b.name}')" style="${currentCustomStyle}" class="px-4 py-2 text-xs rounded-xl border transition-all duration-150 tracking-wide">${b.name}</button>`;
    }).join('');
}

// ==========================================
// 🚀 UNIFIED FILTERING, SORTING & RENDERING PIPELINES
// ==========================================
window.executeLiveSearchFiltering = function() {
    const searchVal = document.getElementById('globalPortalSearchBox').value.trim().toLowerCase();
    const sortVal = document.getElementById('globalPortalSortSelector').value;
    const feed = document.getElementById('publicCardsFeed');
    
    if(!feed) return; // Escape processing bounds if user is reading single deep text nodes view

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
            j.authority.toLowerCase().includes(searchVal) ||
            j.type.toLowerCase().includes(searchVal)
        );
    }

    // Task 3: Sorting Matrix Evaluation
    if(sortVal === 'alpha') {
        dataset.sort((a, b) => a.title.localeCompare(b.title));
    } else if(sortVal === 'oldest') {
        // Fallback processing sequence matching Firestore metadata entries values
        dataset.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    } else {
        dataset.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }

    // Render Left Columns Grids Cards
    if(dataset.length === 0) {
        feed.innerHTML = `<div class="col-span-full text-center py-16 text-xs font-bold text-slate-400 bg-white/40 border border-dashed p-6 rounded-2xl shadow-inner">खोजे गए कीवर्ड या श्रेणी विन्यास अनुसार कोई लाइव रिकॉर्ड नहीं मिला।</div>`;
        return;
    }

    feed.innerHTML = dataset.map(j => {
        let displayImg = "";
        if(globalImageVisibilitySetting === 'show' && j.imageUrls && j.imageUrls.length > 0) {
            displayImg = `<img src="${j.imageUrls[0]}" class="w-full h-44 object-cover rounded-xl mb-3 border border-slate-100" alt="Card Banner">`;
        }

        const catObj = activeDynamicCategoriesList.find(c => c.name.toLowerCase() === j.type.toLowerCase());
        let badgeColorHex = catObj ? catObj.hexColor : '#6366f1';

        return `
            <div class="luxury-card p-5 flex flex-col justify-between">
                <div>
                    ${displayImg}
                    <div class="flex justify-between items-center mb-2.5">
                        <span style="background-color: ${badgeColorHex}12; color: ${badgeColorHex}; border-color: ${badgeColorHex}25;" class="text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase border tracking-wide">${j.type}</span>
                        <span class="text-[11px] font-bold text-slate-400 flex items-center gap-1">⏰ ${j.lastDate || 'Active'}</span>
                    </div>
                    <h3 class="font-extrabold text-slate-800 text-sm lg:text-base mb-1.5 leading-snug tracking-tight">${j.title}</h3>
                    <p class="text-xs text-slate-400 font-bold">🏛️ Board: ${j.authority}</p>
                </div>
                <button onclick="window.navigateToHub('detail', '${j.id}')" class="w-full bg-slate-50 hover:bg-indigo-50 border border-slate-100 text-indigo-600 font-extrabold text-xs text-center py-2.5 rounded-xl mt-4 transition-all shadow-sm">
                    View Details ↗
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
        sidebar.innerHTML = `<p class="text-[11px] font-bold text-slate-400 text-center py-4">No recommendations live.</p>`;
        return;
    }

    sidebar.innerHTML = liveItems.map(j => `
        <div onclick="window.navigateToHub('detail', '${j.id}')" class="bg-white/40 hover:bg-white/80 p-3 rounded-xl border border-white/50 cursor-pointer transition-all flex flex-col gap-1 text-xs">
            <h4 class="font-bold text-slate-800 truncate leading-tight">${j.title}</h4>
            <span class="text-[10px] font-bold text-slate-400 uppercase">${j.authority || 'Notification'}</span>
        </div>
    `).join('');
}

window.renderPostDeepContentView = function(postId) {
    const targetPayloadBox = document.getElementById('detailViewContentPayload');
    const matchedPost = cachedJobsArray.find(item => item.id === postId);
    if(!matchedPost || !targetPayloadBox) return;

    targetPayloadBox.innerHTML = `
        <div class="space-y-4 text-slate-800">
            <h2 class="text-xl lg:text-3xl font-black text-slate-900 leading-tight">${matchedPost.title}</h2>
            <p class="text-sm font-extrabold text-indigo-600">🏛️ Central Board Authority: ${matchedPost.authority}</p>
            <div class="bg-white/80 border p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap font-medium">${matchedPost.description || 'अधिसूचना विवरण की समीक्षा प्रक्रिया जारी है।'}</div>
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
            approvalStatus: "Pending for Approval", // Waiting for Super Admin confirmation node rules
            timestamp: Date.now()
        });
        window.spawnPremiumToastAlert("Proposal Sent", "🎉 विज्ञापन समीक्षा हेतु सुपर एडमिन कतार में भेज दिया गया है!", "success");
        e.target.reset();
    } catch(err) { window.spawnPremiumToastAlert("Error", err.message, "error"); }
};

// ==========================================
// 📡 ROUTING & MOUNT BINDINGS OVERRIDE FLOW
// ==========================================
window.navigateToHub = function(targetViewMode, postId = null) {
    const feedView = document.getElementById('mainFeedRouterBlock');
    const detailView = document.getElementById('postDetailView');
    const contributorView = document.getElementById('contributorDashboardView');
    const filterBar = document.getElementById('globalPortalSearchBox')?.parentElement?.parentElement;

    if(targetViewMode === 'detail') {
        feedView.classList.add('hidden'); contributorView.classList.add('hidden');
        if(filterBar) filterBar.classList.add('hidden');
        detailView.classList.remove('hidden');
        window.renderPostDeepContentView(postId);
    } else if(targetViewMode === 'contributor') {
        feedView.classList.add('hidden'); detailView.classList.add('hidden');
        if(filterBar) filterBar.classList.add('hidden');
        contributorView.classList.remove('hidden');
    } else {
        detailView.classList.add('hidden'); contributorView.classList.add('hidden');
        if(filterBar) filterBar.classList.remove('hidden');
        feedView.classList.remove('hidden');
        window.executeLiveSearchFiltering();
    }
};

window.toggleForgotPasswordViewMode = function(show) {
    document.getElementById('authFormMainGroupBox').classList.toggle('hidden', show);
    document.getElementById('authFormForgotGroupBox').classList.toggle('hidden', !show);
};

window.executeForgotDispatchRecoveryLink = function() {
    const email = document.getElementById('forgotUsrEmail').value.trim();
    window.executeForgotRemainingPipeline(email);
};

function startApplicationCoreEngine() {
    // Stream 1: Synchronize colorful category channels
    onSnapshot(collection(db, "categories"), (snapshot) => {
        activeDynamicCategoriesList = [{ id: 'all', name: 'All', hexColor: '#4f46e5' }];
        snapshot.forEach(docSnap => {
            activeDynamicCategoriesList.push({ id: docSnap.id, name: docSnap.data().name, hexColor: docSnap.data().hexColor || '#1e293b' });
        });
        renderDynamicChipsLayout();
        
        // Populate contributor form select options dropdown channel elements
        const cSelect = document.getElementById('cPostType');
        if(cSelect) {
            cSelect.innerHTML = activeDynamicCategoriesList.filter(c => c.name !== 'All').map(c => `<option value="${c.name}">${c.name}</option>`).join('');
        }
    });

    // Stream 2: Synchronize system grid interface toggles
    onSnapshot(doc(db, "app_settings", "grid_layout"), (docSnap) => {
        if(docSnap.exists()) {
            const d = docSnap.data();
            layoutGridColumnsSetting = d.columnsClass || 'lg:grid-cols-3';
            globalImageVisibilitySetting = d.imageVisibility || 'show';
        }
        window.executeLiveSearchFiltering();
    });

    // Stream 3: Synchronize primary job documents snapshot arrays
    onSnapshot(collection(db, "jobs"), (snapshot) => {
        cachedJobsArray = [];
        snapshot.forEach(docSnap => {
            cachedJobsArray.push({ id: docSnap.id, ...docSnap.data() });
        });
        window.executeLiveSearchFiltering();
        renderRightSidebarRecommendedStack();
    });
}

window.addEventListener('load', startApplicationCoreEngine);
