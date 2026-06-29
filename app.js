import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js";

// 🚨 FIREBASE CONFIG MATRIX
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

// Safe initialization of messaging for browsers supporting it
let messaging = null;
try {
    messaging = getMessaging(app);
} catch (e) {
    console.log("Messaging setup skipped or unsupported in this environment.");
}

let selectedCategoryFilter = 'All';
let cachedJobsArray = [];
let layoutGridColumnsSetting = 'lg:grid-cols-3'; 
let globalImageVisibilitySetting = 'show'; 
let activeDynamicCategoriesList = [
    { name: 'All', colorClass: 'bg-white text-slate-800 border-slate-200 shadow-sm font-bold', hexColor: '#4f46e5' },
    { name: 'Admit Crad', colorClass: 'bg-orange-50 text-orange-700 border-orange-200', hexColor: '#ea580c' },
    { name: 'Result', colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', hexColor: '#059669' },
    { name: 'Sarkari Naukri', colorClass: 'bg-blue-50 text-blue-700 border-blue-200', hexColor: '#2563eb' },
    { name: 'Blogs', colorClass: 'bg-pink-50 text-pink-700 border-pink-200', hexColor: '#db2777' },
    { name: 'Sarkari Yojna', colorClass: 'bg-yellow-50 text-yellow-700 border-yellow-200', hexColor: '#ca8a04' }
];

// ==========================================
// 🔔 PUSH ALERTS SUBSCRIPTION PIPELINE
// ==========================================
window.triggerPlatformPushSubscription = async function() {
    const btn = document.getElementById('btnSubscribePushAlerts');
    const badge = document.getElementById('pushStatusBadge');
    
    if (!messaging || !('Notification' in window)) {
        window.spawnPremiumToastAlert("Not Supported", "आपका ब्राउज़र पुश नोटिफिकेशन सपोर्ट नहीं करता है।", "error");
        return;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const currentToken = await getToken(messaging, { vapidKey: 'YOUR_PUBLIC_VAPID_KEY_HERE' });
            
            if (currentToken) {
                await setDoc(doc(db, "subscribers", currentToken), {
                    subscribedAt: Date.now(),
                    deviceStatus: "Active"
                });
                
                if(badge) { badge.className = "text-[9px] font-black px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 uppercase"; badge.innerText = "Active"; }
                if(btn) { btn.disabled = true; btn.className = "w-full bg-slate-200 text-slate-400 font-bold text-xs py-2 rounded-xl cursor-not-allowed"; btn.innerText = "✓ Subscribed"; }
                window.spawnPremiumToastAlert("Subscribed", "🎉 Notification Alert Enabled Successfully!", "success");
            }
        } else {
            window.spawnPremiumToastAlert("Blocked", "आपने नोटिफिकेशन ब्लॉक कर दिया है।", "error");
        }
    } catch (err) {
        console.error("FCM System Blocked:", err);
    }
};

function checkCurrentSubscriptionState() {
    if ('Notification' in window && Notification.permission === 'granted') {
        const badge = document.getElementById('pushStatusBadge');
        const btn = document.getElementById('btnSubscribePushAlerts');
        if(badge) { badge.className = "text-[9px] font-black px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 uppercase"; badge.innerText = "Active"; }
        if(btn) { btn.disabled = true; btn.className = "w-full bg-slate-200 text-slate-400 font-bold text-xs py-2 rounded-xl cursor-not-allowed"; btn.innerText = "✓ Subscribed"; }
    } else {
        const badge = document.getElementById('pushStatusBadge');
        if(badge) { badge.innerText = "Off"; }
    }
}

// ==========================================
// 🎨 RICH TEXT CUSTOM SELECTION FORMATTING
// ==========================================
window.applyRichFormatting = function(textareaId, mode) {
    const txtArea = document.getElementById(textareaId);
    if (!txtArea) return;
    const start = txtArea.selectionStart;
    const end = txtArea.selectionEnd;
    const selectedText = txtArea.value.substring(start, end);
    
    let replacement = "";
    if(mode === 'link') {
        const url = prompt("Enter complete URL:", "https://");
        if(url) replacement = `<a href="${url}" target="_blank" style="color:#2563eb; text-decoration:underline;">${selectedText || 'Link'}</a>`;
    } else if(mode === 'color') {
        const hex = prompt("Enter text Hex Color Code:", "#ff0000");
        if(hex) replacement = `<span style="color:${hex}; font-weight:bold;">${selectedText || 'Colored Text'}</span>`;
    } else if(mode === 'size') {
        const size = prompt("Enter font size setting (e.g. 14px, 18px, 24px):", "16px");
        if(size) replacement = `<span style="font-size:${size}; font-weight:bold;">${selectedText || 'Sized Text'}</span>`;
    }
    
    if(replacement) {
        txtArea.value = txtArea.value.substring(0, start) + replacement + txtArea.value.substring(end);
    }
};

// ==========================================
// 🔐 IDENTITY REDIRECTION GATEWAY NODES
// ==========================================
window.loginUserNode = async function(email, password) {
    try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        window.spawnPremiumToastAlert("Access Granted", "🎉 लॉगिन सफल!", "success");
        
        onSnapshot(doc(db, "users", credential.user.uid), (docSnap) => {
            if(docSnap.exists() && docSnap.data().role === 'Admin') {
                document.getElementById('adminPortalHeaderBtn')?.classList.remove('hidden');
                window.performSinglePageRoutingView('admin');
            } else {
                window.performSinglePageRoutingView('contributor');
            }
        });
    } catch(err) { window.spawnPremiumToastAlert("Error", err.message, "error"); }
};

window.registerNewUserNode = async function(email, password, fullname) {
    try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", credential.user.uid), { name: fullname, role: "UserContributor", email: email });
        window.spawnPremiumToastAlert("Success", "🎉 पंजीकरण सफल!", "success");
        window.performSinglePageRoutingView('contributor');
    } catch(err) { window.spawnPremiumToastAlert("Error", err.message, "error"); }
};

window.executeForgotRecoveryPipeline = async function() {
    const email = document.getElementById('forgotUsrEmail').value.trim();
    if(!email) return window.spawnPremiumToastAlert("Missing", "ईमेल पता दर्ज करें।", "error");
    try {
        await sendPasswordResetEmail(auth, email);
        window.spawnPremiumToastAlert("Dispatched", "🔑 पासवर्ड रिकवरी ईमेल लिंक भेज दिया गया है।", "success");
        window.toggleAuthOverlay(false);
    } catch(err) { window.spawnPremiumToastAlert("Error", err.message, "error"); }
};

window.togglePasswordRevealNode = function() {
    const element = document.getElementById('usrPass');
    if(element) element.type = element.type === 'password' ? 'text' : 'password';
};

// ==========================================
// ✍️ DRAFTING & APPROVAL MATRIX GATEKEEPERS
// ==========================================
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
        document.getElementById('cTitle').value = ""; document.getElementById('cDesc').value = "";
    } catch(e) { window.spawnPremiumToastAlert("Error", e.message, "error"); }
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
        window.spawnPremiumToastAlert("Live", "🚀 विज्ञापन फ्रंटपेज पर लाइव हो चुका है!", "success");
        document.getElementById('aTitle').value = ""; document.getElementById('aDesc').value = "";
    } catch(e) { window.spawnPremiumToastAlert("Error", e.message, "error"); }
};

window.approvePostItemNode = async function(id) {
    try {
        await updateDoc(doc(db, "jobs", id), { approvalStatus: "Live" });
        window.spawnPremiumToastAlert("Approved", "विज्ञापन फ्रंटपेज पर लाइव कर दिया गया है!", "success");
    } catch(e) { window.spawnPremiumToastAlert("Error", e.message, "error"); }
};

window.rejectPostItemNode = async function(id) {
    try {
        await deleteDoc(doc(db, "jobs", id));
        window.spawnPremiumToastAlert("Removed", "विज्ञापन कतार से हटा दिया गया है।", "error");
    } catch(e) { window.spawnPremiumToastAlert("Error", e.message, "error"); }
};

// ==========================================
// 🚀 DYNAMIC CONTENT RENDERING PIPELINES
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

        // 🌟 FIXED LINK PIPELINE: Integrated with performSinglePageRoutingView perfectly
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
            <p class="text-xs font-bold text-indigo-600 uppercase">🏛️ Authority/Board: ${matched.authority}</p>
            <div class="bg-slate-50 border p-4 rounded-xl text-sm leading-relaxed">${matched.description || 'No data uploaded.'}</div>
        </div>
    `;
};

// ==========================================
// 📡 APP BOOTSTRAP INITIAL RUN CONSOLE SYNC
// ==========================================
function bootstrapApplicationEngine() {
    renderDynamicCategoryChips();
    checkCurrentSubscriptionState();
    
    // Fallback alignment map binding for button routes compatibility
    window.navigateToHub = window.performSinglePageRoutingView;

    onSnapshot(collection(db, "jobs"), (snapshot) => {
        cachedJobsArray = [];
        let approvalQueueHTML = "";
        
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const id = docSnap.id;
            cachedJobsArray.push({ id, ...data });
            
            if(data.approvalStatus === 'Pending') {
                approvalQueueHTML += `
                    <div class="p-3 bg-white border rounded-xl space-y-2 text-xs shadow-inner">
                        <h4 class="font-bold text-slate-800">${data.title}</h4>
                        <div class="flex gap-2 pt-1">
                            <button onclick="window.approvePostItemNode('${id}')" class="bg-emerald-600 text-white font-bold px-2.5 py-1 rounded text-[11px]">Approve & Live</button>
                            <button onclick="window.rejectPostItemNode('${id}')" class="bg-rose-600 text-white font-bold px-2.5 py-1 rounded text-[11px]">Reject</button>
                        </div>
                    </div>`;
            }
        });
        
        const qBox = document.getElementById('adminApprovalQueueTargetList');
        if(qBox) qBox.innerHTML = approvalQueueHTML || `<p class="text-xs font-bold text-slate-400 text-center py-6">कोई भी पोस्ट कतार में लंबित नहीं है।</p>`;
        
        window.executeUIRenderPipeline();
        window.executeSidebarLiveSearchFilters();
    });
}

window.addEventListener('DOMContentLoaded', bootstrapApplicationEngine);
window.executeUIRenderPipeline = window.executeUIRenderPipeline;
