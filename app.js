import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js";

// 🚨 LIVE SYNCHRONIZED CONFIGURATION MATRIX
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
// 🌟 SINGLE-PAGE ROUTING CONSOLE WITH GATEKEEPER SECURITIES
// ==========================================
window.performSinglePageRoutingView = function(targetViewMode, postId = null) {
    const feedView = document.getElementById('mainFeedRouterBlock');
    const detailView = document.getElementById('postDetailView');
    const leftSidebar = document.getElementById('mainLeftSidebarNode');
    const rightSidebar = document.getElementById('subPageRightSidebarNode');
    const mainContentRegion = document.getElementById('coreContentLayoutViewRegion');
    const contributorView = document.getElementById('contributorDashboardView');
    const adminView = document.getElementById('adminMasterConsoleView');
    
    // 🔐 REFRESH / SECURE ACCESS GATEKEEPER SECURITY CHECK
    const currentUser = auth.currentUser;
    if ((targetViewMode === 'admin' || targetViewMode === 'contributor') && !currentUser) {
        window.spawnPremiumToastAlert("Security Alert", "कृपया पहले लॉगिन करें, रिफ्रेश करने पर दोबारा लॉगिन करना अनिवार्य है।", "error");
        window.toggleAuthOverlay(true);
        return;
    }

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
        document.getElementById('authTriggerActionBtn')?.classList.add('hidden');
        document.getElementById('authLogoutHeaderBtn')?.classList.remove('hidden');
    } else if(targetViewMode === 'admin') {
        adminView?.classList.remove('hidden');
        document.getElementById('authTriggerActionBtn')?.classList.add('hidden');
        document.getElementById('authLogoutHeaderBtn')?.classList.remove('hidden');
    } else {
        leftSidebar?.classList.remove('hidden');
        feedView?.classList.remove('hidden');
        window.executeUIRenderPipeline();
    }
};

window.performSecurePlatformLogout = async function() {
    await signOut(auth);
    window.location.reload();
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
// 🎨 INDUSTRIAL RICH TEXT TOOLBAR INJECTOR
// ==========================================
window.applyRichFormatting = function(textareaId, mode) {
    const txtArea = document.getElementById(textareaId);
    if (!txtArea) return;
    const start = txtArea.selectionStart;
    const end = txtArea.selectionEnd;
    const selectedText = txtArea.value.substring(start, end);
    let replacement = "";
    
    if(mode === 'link') {
        const url = prompt("Enter URL link path:", "https://");
        if(url) replacement = `<a href="${url}" target="_blank" style="color:#2563eb;text-decoration:underline;font-weight:bold;">${selectedText || 'Link Text'}</a>`;
    } else if(mode === 'img') {
        const imgUrl = prompt("Enter complete image asset URL:", "https://");
        if(imgUrl) replacement = `<img src="${imgUrl}" class="max-w-full h-auto rounded-xl my-4 shadow-sm border block mx-auto" alt="Post Asset Inline">`;
    } else if(mode === 'color') {
        const hex = prompt("Enter Hex Color code:", "#ff0000");
        if(hex) replacement = `<span style="color:${hex};font-weight:bold;">${selectedText || 'Colored text'}</span>`;
    } else if(mode === 'size') {
        const size = prompt("Enter text size parameters (e.g. 14px, 18px, 24px):", "16px");
        if(size) replacement = `<span style="font-size:${size};font-weight:800;line-height:1.4;">${selectedText || 'Sized text'}</span>`;
    }
    
    if(replacement) txtArea.value = txtArea.value.substring(0, start) + replacement + txtArea.value.substring(end);
};

// ==========================================
// ⚙️ AUTHENTICATION CONTROL PIPELINES
// ==========================================
window.executeAuthActionPipeline = async function() {
    const email = document.getElementById('usrEmail').value.trim();
    const password = document.getElementById('usrPass').value.trim();
    const isRegister = !document.getElementById('regNameBlock').classList.contains('hidden');

    if(isRegister) {
        const fullname = document.getElementById('usrName').value.trim();
        try {
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(doc(db, "users", credential.user.uid)), { name: fullname, role: "UserContributor", email: email });
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
        window.spawnPremiumToastAlert("Dispatched", "🔑 Recovery mail sent.", "success");
        window.toggleAuthOverlay(false);
    } catch(err) { window.spawnPremiumToastAlert("Error", err.message, "error"); }
};

// ==========================================
// DESK CONTROLLERS & DATA WORKSPACE LOGIC
// ==========================================
window.submitProposalPipeline = async function() {
    try {
        await addDoc(collection(db, "jobs"), {
            title: document.getElementById('cTitle').value.trim(),
            authority: document.getElementById('cAuth').value.trim(),
            type: document.getElementById('cType').value,
            lastDate: document.getElementById('cLastDate').value.trim(),
            description: `
                <div class="p-4 bg-indigo-50/50 border rounded-xl my-4 text-xs font-bold text-slate-600">
                    <p>💰 Application Fee: ${document.getElementById('cFees').value.trim() || 'Review PDF'}</p>
                    <p class="mt-1">🎓 Eligibility Matrix: ${document.getElementById('cElig').value.trim() || 'Review Details'}</p>
                </div>
                <div class="text-sm font-medium mt-2">${document.getElementById('cDesc').value.trim()}</div>`,
            approvalStatus: "Pending", 
            timestamp: Date.now()
        });
        window.spawnPremiumToastAlert("Sent", "🎉 समीक्षा हेतु एडमिन कतार में भेजा गया!", "success");
    } catch(e) { alert(e.message); }
};

window.publishDirectAdminNode = async function() {
    const editId = document.getElementById('adminTargetEditingId').value;
    const postPayload = {
        title: document.getElementById('aTitle').value.trim(),
        authority: document.getElementById('aAuth').value.trim(),
        type: document.getElementById('aType').value,
        lastDate: document.getElementById('aLastDate').value.trim(),
        description: `
            <div class="p-4 bg-indigo-50/50 border rounded-xl my-4 text-xs font-bold text-slate-600">
                <p>💰 Application Fee: ${document.getElementById('aFees').value.trim() || 'Review PDF'}</p>
                <p class="mt-1">🎓 Eligibility Matrix: ${document.getElementById('aElig').value.trim() || 'Review Details'}</p>
            </div>
            <div class="text-sm font-medium mt-2">${document.getElementById('aDesc').value.trim()}</div>`,
        approvalStatus: "Live"
    };

    try {
        if(editId) {
            await updateDoc(doc(db, "jobs", editId), postPayload);
            window.spawnPremiumToastAlert("Updated", "🚀 विज्ञापन सफलतापूर्वक अपडेट हो गया है!", "success");
            window.clearAdminEditingFormFieldsState();
        } else {
            postPayload.timestamp = Date.now();
            await addDoc(collection(db, "jobs"), postPayload);
            window.spawnPremiumToastAlert("Live", "🚀 फ्रंटपेज पर लाइव हो चुका है!", "success");
            window.clearAdminEditingFormFieldsState();
        }
    } catch(e) { window.spawnPremiumToastAlert("Error", e.message, "error"); }
};

window.triggerAdminPostEditSelectMode = function(id) {
    const post = cachedJobsArray.find(j => j.id === id);
    if(!post) return;
    
    document.getElementById('adminTargetEditingId').value = id;
    document.getElementById('adminFormHeadlineLabel').innerText = "📝 Edit / Update Post Node";
    document.getElementById('adminSubmitPrimaryActionBtn').innerText = "Update & Save Changes 💾";
    document.getElementById('adminCancelEditNodeBtn').classList.remove('hidden');

    document.getElementById('aTitle').value = post.title || "";
    document.getElementById('aAuth').value = post.authority || "";
    document.getElementById('aType').value = post.type || "Admit Crad";
    document.getElementById('aLastDate').value = post.lastDate || "";
    document.getElementById('aDesc').value = post.description || "";
};

window.clearAdminEditingFormFieldsState = function() {
    document.getElementById('adminTargetEditingId').value = "";
    document.getElementById('adminFormHeadlineLabel').innerText = "Create Direct Live Post Node";
    document.getElementById('adminSubmitPrimaryActionBtn').innerText = "Publish Instantly Live ⚡";
    document.getElementById('adminCancelEditNodeBtn').classList.add('hidden');
    
    document.getElementById('aTitle').value = ""; document.getElementById('aAuth').value = "";
    document.getElementById('aLastDate').value = ""; document.getElementById('aDesc').value = "";
    document.getElementById('aFees').value = ""; document.getElementById('aElig').value = "";
};

window.executePublishNewToolNode = async function() {
    const title = document.getElementById('toolTitle').value.trim();
    const url = document.getElementById('toolUrl').value.trim();
    if(!title || !url) return;
    try {
        await addDoc(collection(db, "pdf_tools"), { title, url, timestamp: Date.now() });
        document.getElementById('toolTitle').value = ""; document.getElementById('toolUrl').value = "";
        window.spawnPremiumToastAlert("Added", "Tool linked on sidebar successfully!", "success");
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
// 📡 APP REAL-TIME SUBSCRIPTION BOOTSTRAP ENGINE
// ==========================================
function bootstrapApplicationEngine() {
    renderDynamicCategoryChips();
    checkCurrentSubscriptionState();
    
    // 🌟 REFRESH LOCK: Automatic strict logout on initialization channel to block unauthorized access
    signOut(auth).then(() => {
        window.navigateToHub = window.performSinglePageRoutingView;
    });

    onSnapshot(collection(db, "jobs"), (snapshot) => {
        cachedJobsArray = [];
        let approvalQueueHTML = "";
        let editablePostsHTML = "";
        
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const id = docSnap.id;
            cachedJobsArray.push({ id, ...data });
            
            if(data.approvalStatus === 'Pending') {
                approvalQueueHTML += `
                    <div class="p-3 bg-white border rounded-xl space-y-2 text-xs shadow-sm">
                        <h4 class="font-bold text-slate-800">${data.title}</h4>
                        <div class="flex gap-2">
                            <button onclick="window.approvePostItemNode('${id}')" class="bg-emerald-600 text-white px-2.5 py-1 rounded font-bold text-[10px]">Approve & Live</button>
                            <button onclick="window.rejectPostItemNode('${id}')" class="bg-rose-600 text-white px-2.5 py-1 rounded font-bold text-[10px]">Reject</button>
                        </div>
                    </div>`;
            } else if(data.approvalStatus === 'Live') {
                editablePostsHTML += `
                    <div class="p-2.5 bg-slate-50 hover:bg-slate-100 border rounded-xl flex items-center justify-between gap-2 text-xs">
                        <span class="font-bold text-slate-700 truncate flex-1">${data.title}</span>
                        <button onclick="window.triggerAdminPostEditSelectMode('${id}')" class="bg-indigo-600 text-white px-3 py-1 rounded font-bold text-[10px]">Edit 📝</button>
                    </div>`;
            }
        });
        
        const qBox = document.getElementById('adminApprovalQueueTargetList');
        if(qBox) qBox.innerHTML = approvalQueueHTML || `<p class="text-xs font-bold text-slate-400 text-center py-4">कोई लंबित पोस्ट नहीं है।</p>`;
        
        const eBox = document.getElementById('adminLivePostsListEditableTargetStack');
        if(eBox) eBox.innerHTML = editablePostsHTML || `<p class="text-xs font-bold text-slate-400 text-center py-4">कोई लाइव पोस्ट नहीं है।</p>`;

        window.executeUIRenderPipeline();
        window.executeSidebarLiveSearchFilters();
    });

    onSnapshot(collection(db, "pdf_tools"), (snapshot) => {
        const container = document.getElementById('publicPdfToolsListTargetStack');
        if(!container) return;
        let html = "";
        snapshot.forEach(d => {
            const t = d.data();
            html += `<a href="${t.url}" target="_blank" class="block w-full text-left bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-700 text-xs font-bold p-2.5 rounded-xl border border-slate-100 truncate transition-all">🛠️ ${t.title}</a>`;
        });
        container.innerHTML = html || `<p class="text-[10px] font-bold text-slate-400 px-2">No tools active.</p>`;
    });
}
window.addEventListener('DOMContentLoaded', bootstrapApplicationEngine);
