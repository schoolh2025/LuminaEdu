import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, doc, onSnapshot, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

let selectedCategoryFilter = 'All';
let cachedJobsArray = [];
let currentActiveGridLayoutClass = 'lg:grid-cols-3'; 
let dynamicLoadedCategoriesArray = [];

window.performSinglePageRoutingView = function(targetViewMode, postId = null) {
    const feedView = document.getElementById('mainFeedRouterBlock');
    const detailView = document.getElementById('postDetailView');
    const leftSidebar = document.getElementById('mainLeftSidebarNode');
    const mainContentRegion = document.getElementById('coreContentLayoutViewRegion');

    feedView?.classList.add('hidden'); detailView?.classList.add('hidden');
    leftSidebar?.classList.add('hidden'); 
    if(mainContentRegion) mainContentRegion.className = "lg:col-span-12 space-y-6 min-w-0 w-full";

    if(targetViewMode === 'detail') {
        detailView?.classList.remove('hidden');
        window.renderPostDeepContentView(postId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        leftSidebar?.classList.remove('hidden');
        feedView?.classList.remove('hidden');
        window.executeUIRenderPipeline();
    }
};

window.handleRenderPolicyDocumentNode = async function(slug) {
    window.performSinglePageRoutingView('detail', null);
    const payload = document.getElementById('detailViewContentPayload');
    if(!payload) return;

    payload.innerHTML = `<p class="text-center text-xs font-bold text-slate-400 py-8 animate-pulse">Loading Custom Live Page Payload Node...</p>`;
    
    try {
        const q = query(collection(db, "created_pages"), where("slug", "==", slug));
        const snap = await getDocs(q);
        let contentHtml = "";
        snap.forEach(d => { contentHtml = d.data().content; });

        if(contentHtml) {
            payload.innerHTML = `<div class="space-y-4"><div class="text-sm font-medium text-slate-700 leading-relaxed">${contentHtml}</div></div>`;
        } else {
            payload.innerHTML = `<div class="p-6 text-center text-xs text-slate-400 font-bold">This dynamic layout page parameters is empty.</div>`;
        }
    } catch(e) { payload.innerHTML = `<p class="text-xs text-rose-500 font-bold">Failed to load custom documents maps.</p>`; }
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
        let currentStyle = isActive ? `style="background-color: ${b.hexColor}; color: white; border-color: ${b.hexColor};"` : `style="background-color: white; color: #1e293b; border-color: #cbd5e1;"`;
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
        feed.innerHTML = `<div class="col-span-full text-center py-12 text-xs font-bold text-slate-400 bg-white/50 border border-dashed p-6 rounded-xl">No postings live inside this scope.</div>`;
        return;
    }

    feed.innerHTML = filtered.map(j => {
        const catObj = dynamicLoadedCategoriesArray.find(c => c.name.toLowerCase() === j.type.toLowerCase());
        let badgeColorHex = catObj ? catObj.hexColor : '#6366f1';
        let isNewAd = (Date.now() - (j.timestamp || 0)) < (2 * 24 * 60 * 60 * 1000);
        let blinkBadge = isNewAd ? `<span class="blinking-new-badge ml-2 text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200 tracking-wide">NEW</span>` : "";
        let shouldHideImg = (j.imageVisibilityMode === 'post_only' || j.imageVisibilityMode === 'none');

        return `
            <div class="premium-glass-card p-5 flex flex-col justify-between bg-white">
                <div>
                    <div class="flex justify-between items-center mb-2.5">
                        <span style="background-color: ${badgeColorHex}15; color: ${badgeColorHex}; border-color: ${badgeColorHex}30;" class="text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase border">${j.type}</span>
                        <span class="text-[11px] font-bold text-slate-400">📅 ${j.lastDate || 'Active'}</span>
                    </div>
                    <h3 class="font-extrabold text-slate-800 text-sm lg:text-base mb-1.5 leading-snug tracking-tight">${j.title} ${blinkBadge}</h3>
                    <p class="text-[11px] text-slate-400 font-bold">🏛️ Board: ${j.authority}</p>
                </div>
                <button onclick="window.performSinglePageRoutingView('detail', '${j.id}')" class="w-full bg-slate-50 hover:bg-indigo-50 border text-indigo-600 font-bold text-xs text-center py-2.5 rounded-xl mt-4 transition-all shadow-sm">View Details ↗</button>
            </div>`;
    }).join('');
};

window.renderPostDeepContentView = function(postId) {
    if(!postId) return; 
    const payload = document.getElementById('detailViewContentPayload');
    const matched = cachedJobsArray.find(item => item.id === postId);
    if(!matched || !payload) return;
    payload.innerHTML = matched.description || 'No content structured.';
    if(matched.imageVisibilityMode === 'main_only' || matched.imageVisibilityMode === 'none') {
        payload.querySelectorAll('img').forEach(img => img.remove());
    }
};

function bootstrapApplicationEngine() {
    window.navigateToHub = window.performSinglePageRoutingView;

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
    });

    // 🌟 FULLY DYNAMIC PLACEMENT LINK AGGREGATION MAPPING ENGINE (TOOLS & CREATED CUSTOM PAGES CORES)
    onSnapshot(collection(db, "pdf_tools"), (snapshot) => {
        const sidebar = document.getElementById('publicPdfToolsListTargetStack');
        const header = document.getElementById('dynamicHeaderLinksStack');
        const footer = document.getElementById('dynamicFooterLinksStack');

        let sidebarHtml = ""; let headerHtml = ""; let footerHtml = "";

        snapshot.forEach(d => {
            const t = d.data();
            const location = t.placementLocation || "sidebar";
            const customHex = t.customColorHex || "#4f46e5";
            
            let itemHtml = `<a href="${t.url}" target="_blank" style="border-color:${customHex}40; color:${customHex};" class="block text-left bg-white hover:bg-slate-50 text-xs font-bold p-2.5 rounded-xl border truncate transition-all">🛠️ ${t.title}</a>`;
            let headerBtn = `<a href="${t.url}" target="_blank" style="background-color:${customHex};" class="text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm hover:opacity-90 transition-all">${t.title}</a>`;
            let footerBtn = `<a href="${t.url}" target="_blank" class="hover:text-white transition-colors">${t.title}</a>`;

            if(location === 'header') headerHtml += headerBtn;
            else if(location === 'footer') footerHtml += footerBtn;
            else sidebarHtml += itemHtml;
        });

        if(sidebar) sidebar.innerHTML = sidebarHtml;
        if(header) header.innerHTML = headerHtml;
        if(footer) footer.innerHTML = footerHtml;
    });

    // CUSTOM LIVE ROUTE PAGES REALTIME RENDERING LISTENER MAPPING CONTROL
    onSnapshot(collection(db, "created_pages"), (snapshot) => {
        const sidebarBox = document.getElementById('dynamicSidebarLinksStack');
        const footerBox = document.getElementById('dynamicFooterLinksStack');
        let sidebarHtml = "";

        snapshot.forEach(d => {
            const p = d.data();
            const location = p.placementLocation || "footer";
            const customHex = p.customColorHex || "#1e293b";

            if(location === 'sidebar') {
                sidebarHtml += `<button onclick="window.handleRenderPolicyDocumentNode('${p.slug}')" style="color:${customHex};" class="w-full flex items-center gap-2 px-4 py-2 font-bold text-xs hover:bg-slate-100 rounded-xl text-left truncate">📄 ${p.slug.toUpperCase()}</button>`;
            } else if (location === 'header') {
                const header = document.getElementById('dynamicHeaderLinksStack');
                if(header) header.innerHTML += `<button onclick="window.handleRenderPolicyDocumentNode('${p.slug}')" style="background-color:${customHex};" class="text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm">${p.slug.toUpperCase()}</button>`;
            } else {
                const footer = document.getElementById('dynamicFooterLinksStack');
                if(footer) footer.innerHTML += `<button onclick="window.handleRenderPolicyDocumentNode('${p.slug}')" class="hover:text-white transition-colors">${p.slug.toUpperCase()}</button>`;
            }
        });
        if(sidebarBox) sidebarBox.innerHTML = sidebarHtml;
    });
}

window.addEventListener('DOMContentLoaded', bootstrapApplicationEngine);
