import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, onSnapshot, updateDoc, deleteDoc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// 🌟 LOGIN PIPELINE WITH FIX FOR SYNC FAULT
window.executeDashboardIdentityLoginPipeline = async function() {
    const enteredPassword = document.getElementById('dashPass').value.trim();
    if(!enteredPassword) return;

    try {
        const docSnap = await getDoc(doc(db, "admin_settings", "root_config"));
        let correctSecureKey = "";

        if (docSnap.exists()) {
            correctSecureKey = docSnap.data().master_password;
        }

        if (correctSecureKey && enteredPassword === correctSecureKey) {
            sessionStorage.setItem("lumina_token", "active");
            document.getElementById('dashboardAuthGatewayGate').classList.add('hidden');
            document.getElementById('adminMasterConsoleView').classList.remove('hidden');
            document.getElementById('dashboardLogoutBtn').classList.remove('hidden');
            window.spawnPremiumToastAlert("Unlocked", "🎉 एडमिन कंसोल सफलतापूर्वक लोड हो गया है!", "success");
            startDatabaseListenersEngine();
        } else if (enteredPassword === "LuminaAdmin@2026") { 
            // Fallback hardcoded password agar database rules fir bhi block karein
            sessionStorage.setItem("lumina_token", "active");
            document.getElementById('dashboardAuthGatewayGate').classList.add('hidden');
            document.getElementById('adminMasterConsoleView').classList.remove('hidden');
            document.getElementById('dashboardLogoutBtn').classList.remove('hidden');
            window.spawnPremiumToastAlert("Unlocked", "🎉 एडमिन कंसोल लोड हो गया है (Bypass)!", "success");
            startDatabaseListenersEngine();
        } else {
            window.spawnPremiumToastAlert("Failed", "❌ पासवर्ड गलत है, कृपया दोबारा जांचें।", "error");
        }
    } catch(err) {
        console.error(err);
        // Rules block hone par bhi backup login handler chalega
        if(enteredPassword === "LuminaAdmin@2026") {
            sessionStorage.setItem("lumina_token", "active");
            document.getElementById('dashboardAuthGatewayGate').classList.add('hidden');
            document.getElementById('adminMasterConsoleView').classList.remove('hidden');
            document.getElementById('dashboardLogoutBtn').classList.remove('hidden');
            window.spawnPremiumToastAlert("Unlocked", "🎉 एडमिन कंसोल बाईपास मोड में लोड हुआ!", "success");
            startDatabaseListenersEngine();
        } else {
            window.spawnPremiumToastAlert("Sync Fault", "डेटाबेस अनुमति नहीं दे रहा है। कृपया स्टेप 1 के रूल्स पब्लिश करें।", "error");
        }
    }
};

window.toggleLockRevealField = function() {
    const input = document.getElementById('dashPass');
    if(input) input.type = input.type === 'password' ? 'text' : 'password';
};

window.performSecurePlatformLogout = function() {
    sessionStorage.clear();
    window.location.replace("../index.html");
};

// TOAST POPUP KO HIDE/CUT KARNE KA DIRECT FUNCTION
window.closeToastAlertPopupManually = function() {
    const toast = document.getElementById('premiumToastNotification');
    if(toast) {
        toast.classList.add('hidden');
        toast.style.display = 'none';
    }
};

window.spawnPremiumToastAlert = function(title, message, type) {
    const toast = document.getElementById('premiumToastNotification');
    if(!toast) return;
    document.getElementById('toastTitleSlot').innerText = title;
    document.getElementById('toastMessageSlot').innerText = message;
    
    // Display block content
    toast.style.display = 'flex';
    toast.className = `fixed top-5 left-1/2 transform -translate-x-1/2 z-[200] max-w-sm w-full mx-4 bg-white border p-4 rounded-2xl shadow-2xl flex items-start gap-3 transition-all duration-300 opacity-100 translate-y-0 ${type==='error'?'border-rose-200 bg-rose-50':'border-emerald-200 bg-emerald-50'}`;
    
    // Auto hide after 4 seconds
    setTimeout(() => { window.closeToastAlertPopupManually(); }, 4000);
};

// TEXT EDITOR MODAL (POPUP MODAL CUT BUTTON FIX)
window.openPremiumTextEditorModal = function(textareaId, mode) {
    formattingTargetTextareaId = textareaId;
    formattingTargetMode = mode;
    const overlay = document.getElementById('premiumRichFormatModalOverlay');
    const input = document.getElementById('premiumModalInputField');
    const title = document.getElementById('premiumModalTitleLabel');
    const subLabel = document.getElementById('premiumModalSubLabel');
    
    if(!overlay || !input) return;
    input.value = mode === 'link' ? 'https://' : mode === 'color' ? '#ff0000' : '16px';
    
    if(mode === 'link') { title.innerText = "🔗 Insert Action Link"; subLabel.innerText = "Enter URL Link:"; }
    else if(mode === 'img') { title.innerText = "🖼️ Insert Image Box"; subLabel.innerText = "Enter Image Asset Web Link:"; }
    else if(mode === 'color') { title.innerText = "🎨 Text Hex Color"; subLabel.innerText = "Enter color code:"; }
    else if(mode === 'size') { title.innerText = "📐 Text Size Adjust"; subLabel.innerText = "Enter size parameters:"; }
    
    overlay.classList.remove('hidden');
    overlay.style.display = 'block';
};

window.closePremiumTextEditorModal = function(shouldApply) {
    const overlay = document.getElementById('premiumRichFormatModalOverlay');
    const input = document.getElementById('premiumModalInputField');
    if(!overlay) return;

    if(shouldApply && input && input.value.trim()) {
        const txtArea = document.getElementById(formattingTargetTextareaId);
        if(txtArea) {
            const start = txtArea.selectionStart;
            const end = txtArea.selectionEnd;
            const selectedText = txtArea.value.substring(start, end);
            let replacement = "";
            let val = input.value.trim();

            if(formattingTargetMode === 'link') replacement = `<a href="${val}" target="_blank" style="color:#2563eb;text-decoration:underline;font-weight:bold;">${selectedText || 'Link'}</a>`;
            else if(formattingTargetMode === 'img') replacement = `<img src="${val}" class="max-w-full h-auto rounded-xl my-4 border block mx-auto" alt="Media Inline Content">`;
            else if(formattingTargetMode === 'color') replacement = `<span style="color:${val};font-weight:bold;">${selectedText || 'Text'}</span>`;
            else if(formattingTargetMode === 'size') replacement = `<span style="font-size:${val};font-weight:800;line-height:1.4;">${selectedText || 'Text'}</span>`;

            txtArea.value = txtArea.value.substring(0, start) + replacement + txtArea.value.substring(end);
        }
    }
    overlay.classList.add('hidden');
    overlay.style.display = 'none';
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
                <p>💰 Application Fee: ${document.getElementById('aFees').value.trim() || 'Review Details'}</p>
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
    document.getElementById('aType').value = post.type || "Admit Card";
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

window.executeAddNewCategoryNode = async function() {
    const name = document.getElementById('newCatName').value.trim();
    const color = document.getElementById('newCatHex').value;
    if(!name) return;
    try {
        await setDoc(doc(db, "dynamic_categories", name), { name, hexColor: color });
        document.getElementById('newCatName').value = "";
        window.spawnPremiumToastAlert("Added", "नई केटेगरी सफलतापूर्वक जुड़ चुकी है!", "success");
    } catch(e) { alert(e.message); }
};

window.executeRemoveCategoryNode = async function(id) {
    if(!confirm("Erase this category mapping node permanently?")) return;
    try {
        await deleteDoc(doc(db, "dynamic_categories", id));
        window.spawnPremiumToastAlert("Removed", "केटेगरी सफलतापूर्वक हटा दी गई है।", "error");
    } catch(e) { alert(e.message); }
};

window.executeSetGridLayoutColumnsNode = async function(columnStyleClass) {
    try {
        await setDoc(doc(db, "admin_settings", "layout_config"), { activeGridClass: columnStyleClass });
        window.spawnPremiumToastAlert("Layout Synced", `ग्रिड अब ${columnStyleClass} पर Set है!`, "success");
        highlightActiveGridLayoutMatrixButtons(columnStyleClass);
    } catch(e) { alert(e.message); }
};

function highlightActiveGridLayoutMatrixButtons(activeStyleClass) {
    document.querySelectorAll('.layout-grid-btn').forEach(btn => {
        if(btn.getAttribute('onclick').includes(activeStyleClass)) {
            btn.className = "layout-grid-btn px-4 py-1.5 text-xs font-bold rounded-xl border bg-indigo-600 text-white shadow-md";
        } else {
            btn.className = "layout-grid-btn px-4 py-1.5 text-xs font-bold rounded-xl border bg-white text-slate-700 shadow-sm";
        }
    });
}

window.executePublishNewToolNode = async function() {
    const title = document.getElementById('toolTitle').value.trim();
    const url = document.getElementById('toolUrl').value.trim();
    if(!title || !url) return;
    try {
        await addDoc(collection(db, "pdf_tools"), { title, url, timestamp: Date.now() });
        document.getElementById('toolTitle').value = ""; document.getElementById('toolUrl').value = "";
        window.spawnPremiumToastAlert("Tool Added", "Tool linked successfully!", "success");
    } catch(e) { alert(e.message); }
};

window.executeRemoveSidebarToolNode = async function(id) {
    if(!confirm("Delete this tool node link?")) return;
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
    onSnapshot(collection(db, "dynamic_categories"), (snapshot) => {
        const selectElement = document.getElementById('aType');
        const adminDeleteContainer = document.getElementById('adminLiveCategoriesDeleteListStack');
        if(!selectElement) return;
        
        let selectHtml = ""; let deleteHtml = "";
        snapshot.forEach(d => {
            const cat = d.data();
            selectHtml += `<option value="${cat.name}">${cat.name}</option>`;
            deleteHtml += `
                <div class="p-2 bg-slate-50 border rounded-xl flex items-center justify-between text-xs gap-2">
                    <span class="font-bold text-slate-700 truncate" style="color: ${cat.hexColor}">${cat.name}</span>
                    <button onclick="window.executeRemoveCategoryNode('${cat.name}')" class="text-rose-600 font-bold hover:underline text-[11px]">Delete</button>
                </div>`;
        });
        selectElement.innerHTML = selectHtml;
        if(adminDeleteContainer) adminDeleteContainer.innerHTML = deleteHtml || `<p class="text-xs text-slate-400 text-center py-2">No categories created.</p>`;
    });

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
                    <div class="p-3 bg-slate-50 border rounded-xl space-y-2 text-xs">
                        <h4 class="font-bold text-slate-800 leading-tight">${data.title}</h4>
                        <div class="flex gap-2">
                            <button onclick="window.approvePostItemNode('${id}')" class="bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-bold text-[10px]">Approve</button>
                            <button onclick="window.rejectPostItemNode('${id}')" class="bg-rose-600 text-white px-2.5 py-1 rounded-lg font-bold text-[10px]">Reject</button>
                        </div>
                    </div>`;
            } else if(data.approvalStatus === 'Live') {
                totalLive++;
                editablePostsHTML += `
                    <div class="p-2.5 bg-slate-50 border rounded-xl flex items-center justify-between text-xs gap-2">
                        <span class="font-bold text-slate-700 truncate flex-1">${data.title}</span>
                        <div class="flex gap-2">
                            <button onclick="window.triggerAdminPostEditSelectMode('${id}')" class="bg-indigo-600 text-white px-2 py-1 rounded-lg font-bold text-[10px]">Edit 📝</button>
                            <button onclick="window.rejectPostItemNode('${id}')" class="text-rose-600 font-bold hover:underline text-[11px]">Erase</button>
                        </div>
                    </div>`;
            }
        });
        
        if(document.getElementById('statTotalCount')) document.getElementById('statTotalCount').innerText = totalLive;
        if(document.getElementById('statPendingCount')) document.getElementById('statPendingCount').innerText = totalPending;
        
        const qBox = document.getElementById('adminApprovalQueueTargetList'); if(qBox) qBox.innerHTML = approvalQueueHTML || `<p class="text-xs text-slate-400 text-center py-4">कोई लंबित पोस्ट नहीं है।</p>`;
        const eBox = document.getElementById('adminLivePostsListEditableTargetStack'); if(eBox) eBox.innerHTML = editablePostsHTML || `<p class="text-xs text-slate-400 text-center py-4">कोई लाइव पोस्ट नहीं है।</p>`;
    });

    onSnapshot(collection(db, "pdf_tools"), (snapshot) => {
        const adminToolsContainer = document.getElementById('adminLiveToolsListDeleteStack');
        let adminHtml = ""; let toolCount = 0;
        
        snapshot.forEach(d => {
            toolCount++;
            const id = d.id; const t = d.data();
            adminHtml += `
                <div class="p-2 bg-slate-50 border rounded-xl flex items-center justify-between text-xs gap-2">
                    <span class="font-bold text-slate-700 truncate flex-1">${t.title}</span>
                    <button onclick="window.executeRemoveSidebarToolNode('${id}')" class="text-rose-600 font-bold hover:underline text-[11px]">Delete</button>
                </div>`;
        });
        if(document.getElementById('statToolsCount')) document.getElementById('statToolsCount').innerText = toolCount;
        if(adminToolsContainer) adminToolsContainer.innerHTML = adminHtml || `<p class="text-xs text-slate-400 text-center py-4">No tools active.</p>`;
    });
}

function verifyPreExistingSession() {
    const sessionToken = sessionStorage.getItem("lumina_token");
    if (sessionToken === "active") {
        document.getElementById('dashboardAuthGatewayGate').classList.add('hidden');
        document.getElementById('adminMasterConsoleView').classList.remove('hidden');
        document.getElementById('dashboardLogoutBtn').classList.remove('hidden');
        startDatabaseListenersEngine();
    } else {
        document.getElementById("dashboardAuthGatewayGate").classList.remove("hidden");
    }
}

window.verifyPreExistingSession = verifyPreExistingSession;
window.addEventListener('DOMContentLoaded', verifyPreExistingSession);
