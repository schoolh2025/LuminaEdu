import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js";

// 🚨 LIVE FIREBASE CONFIGURATION MATRIX
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

let messaging = null;
try { messaging = getMessaging(app); } catch (e) { }

let selectedCategoryFilter = 'All';
let cachedJobsArray = [];
let activeDynamicCategoriesList = [
    { name: 'All', colorClass: 'bg-white text-slate-800 border-slate-200 shadow-sm font-bold', hexColor: '#4f46e5' },
    { name: 'Admit Crad', colorClass: 'bg-orange-50 text-orange-700 border-orange-200', hexColor: '#ea580c' },
    { name: 'Result', colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', hexColor: '#059669' },
    { name: 'Sarkari Naukri', colorClass: 'bg-blue-50 text-blue-700 border-blue-200', hexColor: '#2563eb' },
    { name: 'Blogs', colorClass: 'bg-pink-50 text-pink-700 border-pink-200', hexColor: '#db2777' },
    { name: 'Sarkari Yojna', colorClass: 'bg-yellow-50 text-yellow-700 border-yellow-200', hexColor: '#ca8a04' }
];

// ==========================================
// 🚀 DYNAMIC SINGLE PAGE LAYOUT ROUTER
// ==========================================
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

window.switchAuthForm = function(mode) {
    document.getElementById('regNameBlock')?.classList.toggle('hidden', mode === 'login');
};

window.togglePasswordRevealNode = function() {
    const element = document.getElementById('usrPass');
    if(element) element.type = element.type === 'password' ? 'text' : 'password';
};

window.spawnPremiumToastAlert = function(title, message, type) {
    const toast = document.getElementById('premiumToastNotification');
    if(!toast) return;
    document.getElementById('toastTitleSlot').innerText = title;
    document.getElementById('toastMessageSlot').innerText = message;
    toast.className = `fixed top-5 left-1/2 transform -translate-x-1/2 z-[100] max-w-sm w-full mx-4 bg-white border p-4 rounded-2xl shadow-2xl flex items-start gap-3 transition-all duration-300 opacity-100 translate-y-0 ${type==='error'?'border-rose-200 bg-rose-50':'border-emerald-200 bg-emerald-50'}`;
    setTimeout(() => { toast.classList.add('opacity-0','pointer-events-none'); }, 4000);
};

// ==========================================
// 🔐 AUTH REDIRECTION LAYER TO DASHBOARD
// ==========================================
window.executeAuthActionPipeline = async function() {
    const email = document.getElementById('usrEmail').value.trim();
    const password = document.getElementById('usrPass').value.trim();

    try {
        await signInWithEmailAndPassword(auth, email, password);
        sessionStorage.setItem("lumina_session_auth", "valid");
        window.spawnPremiumToastAlert("Access Granted", "🎉 लॉगिन सफल! डैशबोर्ड खुल रहा है...", "success");
        setTimeout(() => { window.location.href = "dashboard/admin.html"; }, 1200);
    } catch(err) { 
        window.spawnPremiumToastAlert("Error", "लॉगिन विफल! कृपया एडमिन क्रेडेंशियल्स जांचें।", "error"); 
    }
};

// ==========================================
// 📊 REAL-TIME CORE UI RENDERING ENGINE
// ==========================================
window.setJobFilter = function(categoryName) {
    selectedCategoryFilter = categoryName;
    renderDynamicCategoryChips();
    window.executeUIRenderPipeline();
};

function renderDynamicCategoryChips() {
    const box = document.getElementById('categoryFilterContainer');
    if(!box) return;
    box.innerHTML = activeDynamicCategoriesList.map(b => {
        let isActive = selectedCategoryFilter.toLowerCase() === b.name.toLowerCase();
        let currentStyle = isActive ? 'bg-indigo-600 text-white font-bold border-indigo-600 shadow-md' : b.colorClass;
        return `<button onclick="window.setJobFilter('${b.name}')" class="px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all duration-150 ${currentStyle}">${b.name}</button>`;
    }).join('');
}

window.executeUIRenderPipeline = function() {
    const feed = document.getElementById('publicCardsFeed');
    if(!feed) return;
    
    // Filter only approved "Live" posts for the front grid view
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
        const catObj = activeDynamicCategoriesList.find(c => c.name.toLowerCase() === j.type.toLowerCase());
        let badgeColorHex = catObj ? catObj.hexColor : '#6366f1';
        let isNewAd = (Date.now() - (j.timestamp || 0)) < (2 * 24 * 60 * 60 * 1000);
        let blinkBadge = isNewAd ? `<span class="blinking-new-badge ml-2 text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200 tracking-wide">NEW</span>` : "";

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
                <button onclick="window.performSinglePageRoutingView('detail', '${j.id}')" class="w-full bg-slate-50 hover:bg-indigo-50 border text-indigo-600 font-bold text-xs text-center py-2.5 rounded-xl mt-4 transition-all shadow-sm">View Complete Details ↗</button>
            </div>
        `;
    }).join('');
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
    payload.innerHTML = matched.description || 'No data uploaded.';
};

window.triggerPlatformPushSubscription = async function() {
    if (!messaging) return;
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging, { vapidKey: 'YOUR_PUBLIC_VAPID_KEY_HERE' });
            if (token) {
                await setDoc(doc(db, "subscribers", token), { subscribedAt: Date.now() });
                window.spawnPremiumToastAlert("Subscribed", "🎉 Notification turned on!", "success");
            }
        }
    } catch (e) { }
};

function checkCurrentSubscriptionState() {
    if ('Notification' in window && Notification.permission === 'granted') {
        const b = document.getElementById('pushStatusBadge');
        if(b) b.innerText = "Active";
    }
}

// ==========================================
// 📡 APP BOOTSTRAP INITIAL REAL-TIME RECONCILE
// ==========================================
function bootstrapApplicationEngine() {
    renderDynamicCategoryChips();
    checkCurrentSubscriptionState();
    
    // Clear storage cache traces safely on runtime loading sequence
    sessionStorage.removeItem("lumina_session_auth"); 
    signOut(auth);
    window.navigateToHub = window.performSinglePageRoutingView;

    // Real-Time Database Connection Stream
    onSnapshot(collection(db, "jobs"), (snapshot) => {
        cachedJobsArray = [];
        snapshot.forEach(docSnap => { 
            cachedJobsArray.push({ id: docSnap.id, ...docSnap.data() }); 
        });
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
