import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js";

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
let layoutGridColumnsSetting = 'lg:grid-cols-3'; 
let activeDynamicCategoriesList = [
    { name: 'All', colorClass: 'bg-white text-slate-800 border-slate-200 shadow-sm font-bold', hexColor: '#4f46e5' },
    { name: 'Admit Crad', colorClass: 'bg-orange-50 text-orange-700 border-orange-200', hexColor: '#ea580c' },
    { name: 'Result', colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', hexColor: '#059669' },
    { name: 'Sarkari Naukri', colorClass: 'bg-blue-50 text-blue-700 border-blue-200', hexColor: '#2563eb' },
    { name: 'Blogs', colorClass: 'bg-pink-50 text-pink-700 border-pink-200', hexColor: '#db2777' },
    { name: 'Sarkari Yojna', colorClass: 'bg-yellow-50 text-yellow-700 border-yellow-200', hexColor: '#ca8a04' }
];

// ==========================================
// 🌟 UNIFIED WINDOW GLOBAL REBINDING FOR ENGINE CHANNELS
// ==========================================
window.performSinglePageRoutingView = function(targetViewMode, postId = null) {
    const feedView = document.getElementById('mainFeedRouterBlock');
    const detailView = document.getElementById('postDetailView');
    const leftSidebar = document.getElementById('mainLeftSidebarNode');
    const rightSidebar = document.getElementById('subPageRightSidebarNode');
    const mainContentRegion = document.getElementById('coreContentLayoutViewRegion');
    const contributorView = document.getElementById('contributorDashboardView');
    const adminView = document.getElementById('adminMasterConsoleView');
    
    feedView?.classList.add('hidden'); detailView?.classList.add('hidden');
    contributorView?.classList.add('hidden'); adminView?.classList.add('hidden');
    leftSidebar?.classList.add('hidden'); rightSidebar?.classList.add('hidden');
    if(mainContentRegion) mainContentRegion.className = "lg:col-span-12 space-y-6 min-w-0 w-full";

    if(targetViewMode === 'detail') {
        detailView?.classList.remove('hidden');
        rightSidebar?.classList.remove('hidden');
        if(mainContentRegion) mainContentRegion.className = "lg:col-span-8 space-y-6 min-w-0 w-full";
        window.renderPostDeepContentView(postId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if(targetViewMode === 'contributor') {
        contributorView?.classList.remove('hidden');
    } else if(targetViewMode === 'admin') {
        adminView?.classList.remove('hidden');
    } else {
        leftSidebar?.classList.remove('hidden');
        feedView?.classList.remove('hidden');
        window.executeUIRenderPipeline();
    }
};

window.toggleAuthOverlay = function(show) {
    const overlay = document.getElementById('authModalOverlay');
    if(document.getElementById('usrPass')) document.getElementById('usrPass').value = "";
    window.toggleForgotFormModeView(false);
    if(show) { overlay?.classList.remove('hidden'); setTimeout(() => { overlay?.classList.remove('opacity-0'); }, 10); }
    else { overlay?.classList.add('opacity-0'); setTimeout(() => { overlay?.classList.add('hidden'); }, 300); }
};

window.switchAuthForm = function(mode) {
    document.getElementById('regNameBlock')?.classList.toggle('hidden', mode === 'login');
};

window.toggleForgotFormModeView = function(show) {
    document.getElementById('authMainFormGroupBlock')?.classList.toggle('hidden', show);
    document.getElementById('authForgotFormGroupBlock')?.classList.toggle('hidden', !show);
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
    document.getElementById('toastIconSlot').innerText = type === 'error' ? "❌" : "✨";
    toast.className = `fixed top-5 left-1/2 transform -translate-x-1/2 z-[100] max-w-sm w-full mx-4 bg-white border p-4 rounded-2xl shadow-2xl flex items-start gap-3 transition-all duration-300 opacity-100 translate-y-0 ${type==='error'?'border-rose-200 bg-rose-50':'border-emerald-200 bg-emerald-50'}`;
    setTimeout(() => { toast.classList.remove('opacity-100'); toast.classList.add('opacity-0','pointer-events-none'); }, 5000);
};

// ==========================================
// ⚙️ CORE PIPELINES
// ==========================================
window.executeAuthActionPipeline = async function() {
    const email = document.getElementById('usrEmail').value.trim();
    const password = document.getElementById('usrPass').value.trim();
    const isRegister = !document.getElementById('regNameBlock').classList.contains('hidden');

    if(isRegister) {
        const fullname = document.getElementById('usrName').value.trim();
        try {
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, "users", credential.user.uid), { name: fullname, role: "UserContributor", email: email });
            window.spawnPremiumToastAlert("Success", "🎉 पंजीकरण सफल!", "success");
            window.toggleAuthOverlay(false);
            window.performSinglePageRoutingView('contributor');
        } catch(err) { window.spawnPremiumToastAlert("Error", err.message, "error"); }
    } else {
        try {
            const credential = await signInWithEmailAndPassword(auth, email, password);
            window.spawnPremiumToastAlert("Access Granted", "🎉 लॉगिन सफल!", "success");
            window.toggleAuthOverlay(false);
            
            onSnapshot(doc(db, "users", credential.user.uid), (docSnap) => {
                if(docSnap.exists() && docSnap.data().role === 'Admin') {
                    document.getElementById('adminPortalHeaderBtn')?.classList.remove('hidden');
                    window.performSinglePageRoutingView('admin');
                } else {
                    window.performSinglePageRoutingView('contributor');
                }
            });
        } catch(err) { window.spawnPremiumToastAlert("Error", err.message, "error"); }
    }
};

window.executeForgotRecoveryPipeline = async function() {
    const email = document.getElementById('forgotUsrEmail').value.trim();
    try {
        await sendPasswordResetEmail(auth, email);
        window.spawnPremiumToastAlert("Dispatched", "🔑 Recovery mail token link sent.", "success");
        window.toggleAuthOverlay(false);
    } catch(err) { window.spawnPremiumToastAlert("Error", err.message, "error"); }
};

window.applyRichFormatting = function(textareaId, mode) {
    const txtArea = document.getElementById(textareaId);
    if (!txtArea) return;
    const start = txtArea.selectionStart;
    const end = txtArea.selectionEnd;
    const selectedText = txtArea.value.substring(start, end);
    let replacement = "";
    if(mode === 'link') {
        const url = prompt("Enter URL:", "https://");
        if(url) replacement = `<a href="${url}" target="_blank" style="color:#2563eb;text-decoration:underline;">${selectedText || 'Link'}</a>`;
    } else if(mode === 'color') {
        const hex = prompt("Hex Color:", "#ff0000");
        if(hex) replacement = `<span style="color:${hex};font-weight:bold;">${selectedText || 'Text'}</span>`;
    } else if(mode === 'size') {
        const size = prompt("Font Size:", "16px");
        if(size) replacement = `<span style="font-size:${size};font-weight:bold;">${selectedText || 'Text'}</span>`;
    }
    if(replacement) txtArea.value = txtArea.value.substring(0, start) + replacement + txtArea.value.substring(end);
};

window.submitProposalPipeline = async function() {
    try {
        await addDoc(collection(db, "jobs"), {
            title: document.getElementById('cTitle').value.trim(),
            authority: document.getElementById('cAuth').value.trim(),
            type: document.getElementById('cType').value,
            lastDate: document.getElementById('cLastDate').value.trim(),
            description: document.getElementById('cDesc').value.trim(),
            approvalStatus: "Pending", 
            timestamp: Date.now()
        });
        window.spawnPremiumToastAlert("Sent", "🎉 समीक्षा हेतु एडमिन कतार में भेजा गया!", "success");
    } catch(e) { alert(e.message); }
};

window.publishDirectAdminNode = async function() {
    try {
        await addDoc(collection(db, "jobs"), {
            title: document.getElementById('aTitle').value.trim(),
            authority: document.getElementById('aAuth').value.trim(),
            type: document.getElementById('aType').value,
            lastDate: document.getElementById('aLastDate').value.trim(),
            description: document.getElementById('aDesc').value.trim(),
            approvalStatus: "Live",
            timestamp: Date.now()
        });
        window.spawnPremiumToastAlert("Live", "🚀 लाइव हो चुका है!", "success");
    } catch(e) { alert(e.message); }
};

window.approvePostItemNode = async function(id) {
    try {
        await updateDoc(doc(db, "jobs", id), { approvalStatus: "Live" });
        window.spawnPremiumToastAlert("Approved", "पोस्ट लाइव हो गई है!", "success");
    } catch(e) { alert(e.message); }
};

window.rejectPostItemNode = async function(id) {
    try {
        await deleteDoc(doc(db, "jobs", id));
        window.spawnPremiumToastAlert("Removed", "हटा दिया गया है।", "error");
    } catch(e) { alert(e.message); }
};

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

    const filtered = cachedJobsArray.filter(j => {
        if(j.approvalStatus !== 'Live') return false;
        if(selectedCategoryFilter === 'All') return true;
        return j.type.toLowerCase() === selectedCategoryFilter.toLowerCase();
    });

    if(filtered.length === 0) {
        feed.innerHTML = `<div class="col-span-full text-center py-12 text-xs font-bold text-slate-400 bg-white/50 border border-dashed p-6 rounded-xl">कोई पोस्ट उपलब्ध नहीं है।</div>`;
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
        <div onclick="window.performSinglePageRoutingView('detail', '${j.id}')" class="bg-white hover:bg-indigo-50 p-2.5 rounded-xl border cursor-pointer transition-all text-xs shadow-sm">
            <h5 class="font-bold text-slate-800 truncate">${j.title}</h5>
        </div>
    `).join('');
};

window.renderPostDeepContentView = function(postId) {
    const payload = document.getElementById('detailViewContentPayload');
    const matched = cachedJobsArray.find(item => item.id === postId);
    if(!matched || !payload) return;
    payload.innerHTML = `
        <div class="space-y-4">
            <h2 class="text-2xl font-black text-slate-900">${matched.title}</h2>
            <p class="text-xs font-bold text-indigo-600 uppercase">🏛️ Authority: ${matched.authority}</p>
            <div class="bg-slate-50 border p-4 rounded-xl text-sm leading-relaxed">${matched.description || 'No data uploaded.'}</div>
        </div>
    `;
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

function bootstrapApplicationEngine() {
    renderDynamicCategoryChips();
    checkCurrentSubscriptionState();
    
    window.navigateToHub = window.performSinglePageRoutingView;

    onSnapshot(collection(db, "jobs"), (snapshot) => {
        cachedJobsArray = [];
        let approvalQueueHTML = "";
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const id = docSnap.id;
            cachedJobsArray.push({ id, ...data });
            if(data.approvalStatus === 'Pending') {
                approvalQueueHTML += `<div class="p-3 bg-white border rounded-xl space-y-2 text-xs">
                    <h4 class="font-bold text-slate-800">${data.title}</h4>
                    <div class="flex gap-2"><button onclick="window.approvePostItemNode('${id}')" class="bg-emerald-600 text-white px-2 py-1 rounded">Approve</button><button onclick="window.rejectPostItemNode('${id}')" class="bg-rose-600 text-white px-2 py-1 rounded">Reject</button></div>
                </div>`;
            }
        });
        const qBox = document.getElementById('adminApprovalQueueTargetList');
        if(qBox) qBox.innerHTML = approvalQueueHTML || `<p class="text-xs font-bold text-slate-400 text-center py-4">कोई लंबित पोस्ट नहीं है।</p>`;
        window.executeUIRenderPipeline();
        window.executeSidebarLiveSearchFilters();
    });
}
window.addEventListener('DOMContentLoaded', bootstrapApplicationEngine);
