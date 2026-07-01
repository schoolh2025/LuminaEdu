import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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
let currentActiveGridLayoutClass = 'lg:grid-cols-3'; 
let dynamicLoadedCategoriesArray = [];

window.performSinglePageRoutingView = function(targetViewMode, postId = null) {
    const feedView = document.getElementById('mainFeedRouterBlock');
    const detailView = document.getElementById('postDetailView');
    const leftSidebar = document.getElementById('mainLeftSidebarNode');
    const rightSidebar = document.getElementById('subPageRightSidebarNode');
    const mainContentRegion = document.getElementById('coreContentLayoutViewRegion');

    feedView?.classList.add('hidden'); detailView?.classList.add('hidden');
    leftSidebar?.classList.add('hidden'); rightSidebar?.classList.add('hidden');
    if(mainContentRegion) mainContentRegion.className = "lg:col-span-12 space-y-6 min-w-0 w-full";

    if(targetViewMode === 'detail') {
        detailView?.classList.remove('hidden');
        rightSidebar?.classList.remove('hidden');
        if(mainContentRegion) mainContentRegion.className = "lg:col-span-8 space-y-6 min-w-0 w-full";
        window.renderPostDeepContentView(postId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        leftSidebar?.classList.remove('hidden');
        feedView?.classList.remove('hidden');
        window.executeUIRenderPipeline();
    }
};

window.toggleAuthOverlay = function(show) {
    const overlay = document.getElementById('authModalOverlay');
    if(show) { overlay?.classList.remove('hidden'); setTimeout(() => { overlay?.classList.remove('opacity-0'); }, 10); }
    else { overlay?.classList.add('opacity-0'); setTimeout(() => { overlay?.classList.add('hidden'); }, 300); }
};

window.spawnPremiumToastAlert = function(title, message, type) {
    const toast = document.getElementById('premiumToastNotification');
    if(!toast) return;
    document.getElementById('toastTitleSlot').innerText = title;
    document.getElementById('toastMessageSlot').innerText = message;
    toast.className = `fixed top-5 left-1/2 transform -translate-x-1/2 z-[100] max-w-sm w-full mx-4 bg-white border p-4 rounded-2xl shadow-2xl flex items-start gap-3 transition-all duration-300 opacity-100 translate-y-0 ${type==='error'?'border-rose-200 bg-rose-50':'border-emerald-200 bg-emerald-50'}`;
    setTimeout(() => { toast.classList.add('opacity-0','pointer-events-none'); }, 4000);
};

window.executeAuthActionPipeline = function() {
    const password = document.getElementById('usrPass').value.trim();
    if(password) {
        sessionStorage.setItem("lumina_token", "active");
        window.location.href = "dashboard/admin.html";
    }
};

window.setJobFilter = function(categoryName) {
    selectedCategoryFilter = categoryName;
    renderDynamicCategoryChips();
    window.executeUIRenderPipeline();
};

function renderDynamicCategoryChips() {
    const box = document.getElementById('categoryFilterContainer');
    if(!box) return;
    
    let allChips = [{ name: 'All', hexColor: '#4f46e5' }, ...dynamicLoadedCategoriesArray];
    box.innerHTML = allChips.map(b => {
        let isActive = selectedCategoryFilter.toLowerCase() === b.name.toLowerCase();
        // 🌟 SYNCS SELECTIVE CHIP COLOR INLINE FROM THE FIREBASE DATA STREAMS
        let currentStyle = isActive 
            ? `style="background-color: ${b.hexColor}; color: white; border-color: ${b.hexColor};"` 
            : `style="background-color: white; color: #1e293b; border-color: #cbd5e1;"`;
        return `<button onclick="window.setJobFilter('${b.name}')" ${currentStyle} class="px-3.5 py-1.5 text-xs font-bold rounded-xl border shadow-sm transition-all duration-150">${b.name}</button>`;
    }).join('');
}

window.executeUIRenderPipeline = function() {
    const feed = document.getElementById('publicCardsFeed');
    if(!feed) return;
    
    feed.className = `grid grid-cols-1 md:grid-cols-2 gap-6 ${currentActiveGridLayoutClass}`;
    const filtered = cachedJobsArray.filter(j => {
        if(j.approvalStatus !== 'Live') return false;
        if(selectedCategoryFilter === 'All') return true;
        return j.type.toLowerCase() === selectedCategoryFilter.toLowerCase();
    });

    if(filtered.length === 0) {
        feed.innerHTML = `<div class="col-span-full text-center py-12 text-xs font-bold text-slate-400 bg-white/50 border border-dashed p-6 rounded-xl">इस श्रेणी में कोई सक्रिय पोस्ट उपलब्ध नहीं है।</div>`;
        return;
    }

    feed.innerHTML = filtered.map(j => {
        const catObj = dynamicLoadedCategoriesArray.find(c => c.name.toLowerCase() === j.type.toLowerCase());
        let badgeColorHex = catObj ? catObj.hexColor : '#6366f1';
        let isNewAd = (Date.now() - (j.timestamp || 0)) < (2 * 24 * 60 * 60 * 1000);
        let blinkBadge = isNewAd ? `<span class="blinking-new-badge ml-2 text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200 tracking-wide">NEW</span>` : "";

        // 🌟 CONDITIONAL IMAGE DISPLAY STRATEGY ACCORDING TO IMAGE_C67EDE.JPG
        const visibility = j.imageVisibilityMode || "both";
        let shouldHideImg = (visibility === 'post_only' || visibility === 'none');

        return `
            <div class="premium-glass-card p-5 flex flex-col justify-between bg-white ${shouldHideImg ? 'hide-embedded-images-context' : ''}">
                <div>
                    <div class="flex justify-between items-center mb-2.5">
                        <span style="background-color: ${badgeColorHex}15; color: ${badgeColorHex}; border-color: ${badgeColorHex}30;" class="text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase border">${j.type}</span>
                        <span class="text-[11px] font-bold text-slate-400">📅 ${j.lastDate || 'Active'}</span>
                    </div>
                    <h3 class="font-extrabold text-slate-800 text-sm lg:text-base mb-1.5 leading-snug tracking-tight">${j.title} ${blinkBadge}</h3>
                    <p class="text-[11px] text-slate-400 font-bold">🏛️ Board: ${j.authority}</p>
                </div>
                <button onclick="window.performSinglePageRoutingView('detail', '${j.id}')" class="w-full bg-slate-50 hover:bg-indigo-50 border text-indigo-600 font-bold text-xs text-center py-2.5 rounded-xl mt-4 transition-all shadow-sm">View Complete Details ↗</button>
            </div>
        `;
    }).join('');
    
    // Inject global stylesheet overrides into runtime frame safely to drop images on demand
    let styleTag = document.getElementById('override-img-visibility-ruleset');
    if(!styleTag){
        styleTag = document.createElement('style');
        styleTag.id = 'override-img-visibility-ruleset';
        document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = ".hide-embedded-images-context img { display: none !important; }";
};

window.executeSidebarLiveSearchFilters = function() {
    const query = document.getElementById('sidebarLiveSearchBox')?.value.trim().toLowerCase() || "";
    const stack = document.getElementById('rightSidebarLiveCollectionStack');
    if(!stack) return;
    const filteredStack = cachedJobsArray.filter(j => j.approvalStatus === 'Live' && (j.title.toLowerCase().includes(query) || j.authority.toLowerCase().includes(query)));
    stack.innerHTML = filteredStack.slice(0, 6).map(j => `
        <div onclick="window.performSinglePageRoutingView('detail', '${j.id}')" class="bg-white hover:bg-indigo-50 p-2.5 rounded-xl border cursor-pointer text-xs shadow-sm">
            <h5 class="font-bold text-slate-800 truncate">${j.title}</h5>
        </div>
    `).join('');
};

window.renderPostDeepContentView = function(postId) {
    const payload = document.getElementById('detailViewContentPayload');
    const matched = cachedJobsArray.find(item => item.id === postId);
    if(!matched || !payload) return;

    // 🌟 DETAIL PAGE IMAGE VISIBILITY MATRIX CHECKER RULES
    const visibility = matched.imageVisibilityMode || "both";
    const hideOnPostPage = (visibility === 'main_only' || visibility === 'none');
    
    payload.innerHTML = matched.description || 'No data uploaded.';
    if(hideOnPostPage) {
        payload.querySelectorAll('img').forEach(img => img.remove());
    }
};

function bootstrapApplicationEngine() {
    sessionStorage.removeItem("lumina_token"); 
    signOut(auth);

    onSnapshot(doc(db, "admin_settings", "layout_config"), (d) => {
        if(d.exists()) {
            let cls = d.data().activeGridClass;
            currentActiveGridLayoutClass = cls === 'grid-cols-2' ? 'xl:grid-cols-2' : cls === 'grid-cols-4' ? 'xl:grid-cols-4' : cls === 'grid-cols-6' ? 'xl:grid-cols-4 2xl:grid-cols-6' : 'xl:grid-cols-3';
            window.executeUIRenderPipeline();
        }
    });

    onSnapshot(collection(db, "dynamic_categories"), (snapshot) => {
        dynamicLoadedCategoriesArray = [];
        snapshot.forEach(docSnap => { dynamicLoadedCategoriesArray.push(docSnap.data()); });
        renderDynamicCategoryChips();
        window.executeUIRenderPipeline();
    });

    onSnapshot(collection(db, "jobs"), (snapshot) => {
        cachedJobsArray = [];
        snapshot.forEach(docSnap => { cachedJobsArray.push({ id: docSnap.id, ...docSnap.data() }); });
        window.executeUIRenderPipeline();
        window.executeSidebarLiveSearchFilters();
    });

    onSnapshot(collection(db, "pdf_tools"), (snapshot) => {
        const container = document.getElementById('publicPdfToolsListTargetStack');
        if(!container) return;
        let html = "";
        snapshot.forEach(d => {
            const t = d.data();
            html += `<a href="${t.url}" target="_blank" class="block w-full text-left bg-slate-50 hover:bg-purple-50 text-slate-700 text-xs font-bold p-2.5 rounded-xl border truncate transition-all">🛠️ ${t.title}</a>`;
        });
        container.innerHTML = html || `<p class="text-[10px] font-bold text-slate-400 px-2">No tools active.</p>`;
    });
}

window.addEventListener('DOMContentLoaded', bootstrapApplicationEngine);
