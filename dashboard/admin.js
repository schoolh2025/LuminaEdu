import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, onSnapshot, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

let cachedJobsArray = [];
let formattingTargetTextareaId = "";
let formattingTargetMode = "";

// 🔒 THE EXCLUSIVE MASTER SYSTEM PASSWORD DEFINED
const ROOT_COMMAND_PHRASE = "LuminaAdmin@2026"; 

// ==========================================
// 🛡️ PASSWORD ONLY INGRESS VALIDATION GATEWAY
// ==========================================
window.executeDashboardIdentityLoginPipeline = function() {
    const enteredPassword = document.getElementById('dashPass').value;
    
    if (enteredPassword === ROOT_COMMAND_PHRASE) {
        sessionStorage.setItem("lumina_session_auth", "authorized_root");
        window.spawnPremiumToastAlert("Engine Unlocked", "🎉 System Panel successfully decrypted!", "success");
        initiateConsoleWorkspaceEngine();
    } else {
        window.spawnPremiumToastAlert("Access Denied", "❌ Incorrect Security Credentials!", "error");
    }
};

window.toggleLockRevealField = function() {
    const input = document.getElementById('dashPass');
    const label = document.getElementById('passEyeIcon');
    if(input.type === "password") {
        input.type = "text";
        label.innerText = "🔒";
    } else {
        input.type = "password";
        label.innerText = "👁️";
    }
};

window.performSecurePlatformLogout = function() {
    sessionStorage.clear();
    window.location.reload();
};

window.spawnPremiumToastAlert = function(title, message, type) {
    const toast = document.getElementById('premiumToastNotification');
    if(!toast) return;
    document.getElementById('toastTitleSlot').innerText = title;
    document.getElementById('toastMessageSlot').innerText = message;
    
    if(type === 'error') {
        toast.style.borderColor = 'rgba(239, 68, 68, 0.4)';
        document.getElementById('toastIconSlot').innerText = "🚨";
    } else {
        toast.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        document.getElementById('toastIconSlot').innerText = "⚡";
    }
    
    toast.classList.remove('opacity-0', 'pointer-events-none');
    setTimeout(() => { toast.classList.add('opacity-0','pointer-events-none'); }, 4000);
};

// ==========================================
// 🎨 CUSTOM RICH FORMAT ENGINE CONTROL
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
    
    if(mode === 'link') { title.innerText = "🔗 Insert Action Link"; subLabel.innerText = "Target Web Address:"; }
    else if(mode === 'img') { title.innerText = "🖼️ Insert Image Banner URL"; subLabel.innerText = "Image Asset Link:"; input.value = "https://"; }
    else if(mode === 'color') { title.innerText = "🎨 Apply Hex Text Color"; subLabel.innerText = "Hex code color:"; }
    else if(mode === 'size') { title.innerText = "📐 Set Specific Text Size"; subLabel.innerText = "Font constraint value (e.g. 18px):"; }
    
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

            if(formattingTargetMode === 'link') replacement = `<a href="${val}" target="_blank" style="color:#6366f1;text-decoration:underline;font-weight:bold;">${selectedText || 'Link'}</a>`;
            else if(formattingTargetMode === 'img') replacement = `<img src="${val}" class="max-w-full h-auto rounded-xl my-4 border border-slate-800 shadow-2xl block mx-auto" alt="Media Inline Content">`;
            else if(formattingTargetMode === 'color') replacement = `<span style="color:${val};font-weight:bold;">${selectedText || 'Text'}</span>`;
            else if(formattingTargetMode === 'size') replacement = `<span style="font-size:${val};font-weight:800;line-height:1.4;">${selectedText || 'Text'}</span>`;

            txtArea.value = txtArea.value.substring(0, start) + replacement + txtArea.value.substring(end);
        }
    }
    overlay.classList.add('opacity-0');
    setTimeout(() => { overlay.classList.add('hidden'); }, 200);
};

window.publishDirectAdminNode = async function() {
    const editId = document.getElementById('adminTargetEditingId').value;
    const postPayload = {
        title: document.getElementById('aTitle').value.trim(),
        authority: document.getElementById('aAuth').value.trim(),
        type: document.getElementById('aType').value,
        lastDate: document.getElementById('aLastDate').value.trim(),
        description: `
            <div class="p-4 bg-slate-900/50 border border-slate-800 rounded-xl my-4 text-xs font-bold text-slate-400">
                <p>💰 Application Fee: ${document.getElementById('aFees').value.trim() || 'Review PDF'}</p>
                <p class="mt-1">🎓 Eligibility Matrix: ${document.getElementById('aElig').value.trim() || 'Review Details'}</p>
            </div>
            <div class="text-sm font-medium mt-2 text-slate-300">${document.getElementById('aDesc').value.trim()}</div>`,
        approvalStatus: "Live"
    };

    try {
        if(editId) {
            await updateDoc(doc(db, "jobs", editId), postPayload);
            window.spawnPremiumToastAlert("Updated", "🚀 Post Node sync status updated!", "success");
            window.clearAdminEditingFormFieldsState();
        } else {
            postPayload.timestamp = Date.now();
            await addDoc(collection(db, "jobs"), postPayload);
            window.spawnPremiumToastAlert("Live", "🚀 Node deployment active on feed!", "success");
            window.clearAdminEditingFormFieldsState();
        }
    } catch(e) { window.spawnPremiumToastAlert("System Error", e.message, "error"); }
};

window.triggerAdminPostEditSelectMode = function(id) {
    const post = cachedJobsArray.find(j => j.id === id);
    if(!post) return;
    document.getElementById('adminTargetEditingId').value = id;
    document.getElementById('adminFormHeadlineLabel').innerText = "📝 Edit / Update Post Node";
    document.getElementById('adminSubmitPrimaryActionBtn').innerText = "Save Database Updates 💾";
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
        window.spawnPremiumToastAlert("Link Tool Added", "Tool synced perfectly!", "success");
    } catch(e) { alert(e.message); }
};

window.executeRemoveSidebarToolNode = async function(id) {
    if(!confirm("Erase this system sidebar tool link?")) return;
    try {
        await deleteDoc(doc(db, "pdf_tools", id));
        window.spawnPremiumToastAlert("Removed", "Tool wiped permanently.", "error");
    } catch(e) { alert(e.message); }
};

window.approvePostItemNode = async function(id) {
    try {
        await updateDoc(doc(db, "jobs", id), { approvalStatus: "Live" });
        window.spawnPremiumToastAlert("Approved", "Node promoted to Live status!", "success");
    } catch(e) { alert(e.message); }
};

window.rejectPostItemNode = async function(id) {
    try {
        await deleteDoc(doc(db, "jobs", id));
        window.spawnPremiumToastAlert("Rejected", "Submission deleted from queue.", "error");
    } catch(e) { alert(e.message); }
};

// ==========================================
// 🏗️ RENDER DYNAMIC CONTROL DESK CONSOLE
// ==========================================
function initiateConsoleWorkspaceEngine() {
    document.getElementById("dashboardAuthGatewayGate").classList.add("hidden");
    document.getElementById("adminMasterConsoleView").classList.remove("hidden");
    document.getElementById("dashboardLogoutBtn").classList.remove("hidden");

    onSnapshot(collection(db, "jobs"), (snapshot) => {
        cachedJobsArray = [];
        let approvalQueueHTML = ""; let editablePostsHTML = "";
        let totalLive = 0; let totalPending = 0;
        
        snapshot.forEach(docSnap => {
            const data = docSnap.data(); const id = docSnap.id;
            cachedJobsArray.push({ id, ...data });
            
            if(data.approvalStatus === 'Pending') {
                totalPending++;
                approvalQueueHTML += `
                    <div class="p-3 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2 text-xs">
                        <h4 class="font-bold text-slate-200 leading-tight">${data.title}</h4>
                        <div class="flex gap-2">
                            <button onclick="window.approvePostItemNode('${id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold text-[10px]">Approve</button>
                            <button onclick="window.rejectPostItemNode('${id}')" class="bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded-lg font-bold text-[10px]">Reject</button>
                        </div>
                    </div>`;
            } else if(data.approvalStatus === 'Live') {
                totalLive++;
                editablePostsHTML += `
                    <div class="p-2.5 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-between text-xs gap-2">
                        <span class="font-bold text-slate-300 truncate flex-1">${data.title}</span>
                        <button onclick="window.triggerAdminPostEditSelectMode('${id}')" class="bg-indigo-600/80 hover:bg-indigo-600 text-white px-2.5 py-1 rounded-lg font-bold text-[10px] shrink-0">Edit 📝</button>
                    </div>`;
            }
        });
        
        document.getElementById('statTotalCount').innerText = totalLive;
        document.getElementById('statPendingCount').innerText = totalPending;
        
        const qBox = document.getElementById('adminApprovalQueueTargetList'); if(qBox) qBox.innerHTML = approvalQueueHTML || `<p class="text-xs text-slate-500 text-center py-4 font-mono">NO SUBMISSIONS FOUND</p>`;
        const eBox = document.getElementById('adminLivePostsListEditableTargetStack'); if(eBox) eBox.innerHTML = editablePostsHTML || `<p class="text-xs text-slate-500 text-center py-4 font-mono">NO ACTIVE LIVE NODES</p>`;
    });

    onSnapshot(collection(db, "pdf_tools"), (snapshot) => {
        const adminToolsContainer = document.getElementById('adminLiveToolsListDeleteStack');
        let adminHtml = ""; let toolCount = 0;
        
        snapshot.forEach(d => {
            toolCount++;
            const id = d.id; const t = d.data();
            adminHtml += `
                <div class="p-2.5 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-between text-xs gap-2">
                    <span class="font-bold text-slate-300 truncate flex-1">${t.title}</span>
                    <button onclick="window.executeRemoveSidebarToolNode('${id}')" class="text-rose-400 hover:text-rose-500 font-bold text-[11px] px-1">Delete</button>
                </div>`;
        });
        document.getElementById('statToolsCount').innerText = toolCount;
        if(adminToolsContainer) adminToolsContainer.innerHTML = adminHtml || `<p class="text-xs text-slate-500 text-center py-4 font-mono">NO ACTIVE SIDEBAR TOOLS</p>`;
    });
}

function verifyPreExistingSession() {
    const sessionToken = sessionStorage.getItem("lumina_session_auth");
    if (sessionToken === "authorized_root") {
        initiateConsoleWorkspaceEngine();
    } else {
        document.getElementById("dashboardAuthGatewayGate").classList.remove("hidden");
    }
}

window.addEventListener('DOMContentLoaded', verifyPreExistingSession);
