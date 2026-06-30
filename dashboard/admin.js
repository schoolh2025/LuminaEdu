import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

let cachedJobsArray = [];
let formattingTargetTextareaId = "";
let formattingTargetMode = "";

// ==========================================
// 🔐 REFRESH SECURE FLOW MANAGEMENT PIPELINE
// ==========================================
window.executeDashboardIdentityLoginPipeline = async function() {
    const email = document.getElementById('dashEmail').value.trim();
    const password = document.getElementById('dashPass').value.trim();
    
    if(!email || !password) return;
    try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        sessionStorage.setItem("lumina_session_auth", "valid");
        
        onSnapshot(doc(db, "users", credential.user.uid), (docSnap) => {
            document.getElementById('dashboardAuthGatewayGate').classList.add('hidden');
            document.getElementById('dashboardLogoutBtn').classList.remove('hidden');
            
            if(docSnap.exists() && docSnap.data().role === 'Admin') {
                document.getElementById('adminMasterConsoleView').classList.remove('hidden');
            } else {
                document.getElementById('contributorDashboardView').classList.remove('hidden');
            }
            window.spawnPremiumToastAlert("Access Granted", "🎉 पैनल सफलतापूर्वक अनलॉक हो चुका है!", "success");
        });
    } catch(err) { window.spawnPremiumToastAlert("Auth Failed", err.message, "error"); }
};

window.performSecurePlatformLogout = async function() {
    sessionStorage.clear();
    await signOut(auth);
    window.location.reload();
};

window.spawnPremiumToastAlert = function(title, message, type) {
    const toast = document.getElementById('premiumToastNotification');
    if(!toast) return;
    document.getElementById('toastTitleSlot').innerText = title;
    document.getElementById('toastMessageSlot').innerText = message;
    toast.className = `fixed top-5 left-1/2 transform -translate-x-1/2 z-[200] max-w-sm w-full mx-4 bg-white border p-4 rounded-2xl shadow-2xl flex items-start gap-3 transition-all duration-300 opacity-100 translate-y-0 ${type==='error'?'border-rose-200 bg-rose-50':'border-emerald-200 bg-emerald-50'}`;
    setTimeout(() => { toast.classList.remove('opacity-100'); toast.classList.add('opacity-0','pointer-events-none'); }, 5000);
};

// ==========================================
// 🎨 TIMELY CLOSABLE RICH FORMAT INTERFACE
// ==========================================
window.openPremiumTextEditorModal = function(textareaId, mode) {
    formattingTargetTextareaId = textareaId;
    formattingTargetMode = mode;
    const overlay = document.getElementById('premiumRichFormatModalOverlay');
    const input = document.getElementById('premiumModalInputField');
    const title = document.getElementById('premiumModalTitleLabel');
    const subLabel = document.getElementById('premiumModalSubLabel');
    
    if(!overlay || !input) return;
    input.value = mode === 'link' ? 'https://' : mode === 'color' ? '#ff0000' : '16px';
    
    if(mode === 'link') { title.innerText = "🔗 Insert Action Link"; subLabel.innerText = "Enter full target path web URL address:"; }
    else if(mode === 'img') { title.innerText = "🖼️ Insert Image Banner URL"; subLabel.innerText = "Provide complete image asset path link:"; input.value = "https://"; }
    else if(mode === 'color') { title.innerText = "🎨 Apply Hex Text Color"; subLabel.innerText = "Enter text color hex code value:"; }
    else if(mode === 'size') { title.innerText = "📐 Set Specific Text Size"; subLabel.innerText = "Define font size bounds constraints (e.g. 18px):"; }
    
    overlay.classList.remove('hidden');
    setTimeout(() => { overlay.classList.remove('opacity-0'); input.focus(); }, 50);
};

window.closePremiumTextEditorModal = function(shouldApply) {
    const overlay = document.getElementById('premiumRichFormatModalOverlay');
    const input = document.getElementById('premiumModalInputField');
    if(!overlay || !input) return;

    if(shouldApply && input.value.trim()) {
        const txtArea = document.getElementById(formattingTargetTextareaId);
        if(txtArea) {
            const start = txtArea.selectionStart;
            const end = txtArea.selectionEnd;
            const selectedText = txtArea.value.substring(start, end);
            let replacement = "";
            let val = input.value.trim();

            if(formattingTargetMode === 'link') replacement = `<a href="${val}" target="_blank" style="color:#2563eb;text-decoration:underline;font-weight:bold;">${selectedText || 'Link'}</a>`;
            else if(formattingTargetMode === 'img') replacement = `<img src="${val}" class="max-w-full h-auto rounded-xl my-4 border shadow-inner block mx-auto" alt="Media Inline Content">`;
            else if(formattingTargetMode === 'color') replacement = `<span style="color:${val};font-weight:bold;">${selectedText || 'Text'}</span>`;
            else if(formattingTargetMode === 'size') replacement = `<span style="font-size:${val};font-weight:800;line-height:1.4;">${selectedText || 'Text'}</span>`;

            txtArea.value = txtArea.value.substring(0, start) + replacement + txtArea.value.substring(end);
        }
    }
    overlay.classList.add('opacity-0');
    setTimeout(() => { overlay.classList.add('hidden'); }, 200);
};

window.submitProposalPipeline = async function() {
    try {
        await addDoc(collection(db, "jobs"), {
            title: document.getElementById('cTitle').value.trim(),
            authority: document.getElementById('cAuth').value.trim(),
            type: document.getElementById('cType').value,
            description: `
                <div class="p-4 bg-indigo-50/50 border rounded-xl my-4 text-xs font-bold text-slate-600">
                    <p>💰 Application Fee: ${document.getElementById('cFees').value.trim() || 'Review PDF'}</p>
                    <p class="mt-1">🎓 Eligibility Matrix: ${document.getElementById('cElig').value.trim() || 'Review Details'}</p>
                </div>
                <div class="text-sm font-medium mt-2">${document.getElementById('cDesc').value.trim()}</div>`,
            approvalStatus: "Pending", 
            timestamp: Date.now(),
            lastDate: document.getElementById('cLastDate').value.trim()
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
        window.spawnPremiumToastAlert("Added", "Tool linked successfully!", "success");
    } catch(e) { alert(e.message); }
};

window.executeRemoveSidebarToolNode = async function(id) {
    if(!confirm("Erase this sidebar tool link?")) return;
    try {
        await deleteDoc(doc(db, "pdf_tools", id));
        window.spawnPremiumToastAlert("Removed", "Tool removed permanently.", "error");
    } catch(e) { alert(e.message); }
};

window.approvePostItemNode = async function(id) {
    try {
        await updateDoc(doc(db, "jobs", id), { approvalStatus: "Live" });
        window.spawnPremiumToastAlert("Approved", "विज्ञापन लाइव हो चुका है!", "success");
    } catch(e) { alert(e.message); }
};

window.rejectPostItemNode = async function(id) {
    try {
        await deleteDoc(doc(db, "jobs", id));
        window.spawnPremiumToastAlert("Removed", "विज्ञापन हटा दिया गया है।", "error");
    } catch(e) { alert(e.message); }
};

function startDatabaseListenersEngine() {
    // Session status fallback lock validation check rule
    const isStoredSessionActive = sessionStorage.getItem("lumina_session_auth");
    
    onAuthStateChanged(auth, (user) => {
        if (user && isStoredSessionActive === "valid") {
            onSnapshot(doc(db, "users", user.uid), (docSnap) => {
                document.getElementById("dashboardAuthGatewayGate")?.classList.add("hidden");
                document.getElementById('dashboardLogoutBtn').classList.remove('hidden');
                
                if (docSnap.exists() && docSnap.data().role === "Admin") {
                    document.getElementById("adminMasterConsoleView").classList.remove("hidden");
                } else {
                    document.getElementById("contributorDashboardView").classList.remove("hidden");
                }
            });
        } else {
            // Keep completely clean if auth is empty
            document.getElementById("dashboardAuthGatewayGate").classList.remove("hidden");
            document.getElementById("adminMasterConsoleView").classList.add("hidden");
            document.getElementById("contributorDashboardView").classList.add("hidden");
            document.getElementById("dashboardLogoutBtn").classList.add("hidden");
        }
    });

    onSnapshot(collection(db, "jobs"), (snapshot) => {
        cachedJobsArray = [];
        let approvalQueueHTML = ""; let editablePostsHTML = "";
        snapshot.forEach(docSnap => {
            const data = docSnap.data(); const id = docSnap.id;
            cachedJobsArray.push({ id, ...data });
            if(data.approvalStatus === 'Pending') {
                approvalQueueHTML += `<div class="p-3 bg-white border rounded-xl space-y-2 text-xs shadow-sm"><h4 class="font-bold text-slate-800 text-[11px] leading-tight">${data.title}</h4><div class="flex gap-2"><button onclick="window.approvePostItemNode('${id}')" class="bg-emerald-600 text-white px-2.5 py-1 rounded font-bold text-[10px]">Approve</button><button onclick="window.rejectPostItemNode('${id}')" class="bg-rose-600 text-white px-2.5 py-1 rounded font-bold text-[10px]">Reject</button></div></div>`;
            } else if(data.approvalStatus === 'Live') {
                editablePostsHTML += `<div class="p-2 bg-slate-50 border rounded-xl flex items-center justify-between text-xs gap-2"><span class="font-bold text-slate-700 truncate flex-1">${data.title}</span><button onclick="window.triggerAdminPostEditSelectMode('${id}')" class="bg-indigo-600 text-white px-2 py-1 rounded font-bold text-[10px]">Edit 📝</button></div>`;
            }
        });
        const qBox = document.getElementById('adminApprovalQueueTargetList'); if(qBox) qBox.innerHTML = approvalQueueHTML || `<p class="text-xs text-slate-400 text-center py-2">No pending posts.</p>`;
        const eBox = document.getElementById('adminLivePostsListEditableTargetStack'); if(eBox) eBox.innerHTML = editablePostsHTML || `<p class="text-xs text-slate-400 text-center py-2">No live posts.</p>`;
    });

    onSnapshot(collection(db, "pdf_tools"), (snapshot) => {
        const adminToolsContainer = document.getElementById('adminLiveToolsListDeleteStack');
        let adminHtml = "";
        snapshot.forEach(d => {
            const id = d.id; const t = d.data();
            adminHtml += `<div class="p-2 bg-slate-50 border rounded-xl flex items-center justify-between text-xs gap-2"><span class="font-bold text-slate-700 truncate flex-1">${t.title}</span><button onclick="window.executeRemoveSidebarToolNode('${id}')" class="text-rose-600 font-bold text-[11px]">Delete</button></div>`;
        });
        if(adminToolsContainer) adminToolsContainer.innerHTML = adminHtml || `<p class="text-xs text-slate-400 text-center py-2">No tools created.</p>`;
    });
}
window.addEventListener('DOMContentLoaded', startDatabaseListenersEngine);
