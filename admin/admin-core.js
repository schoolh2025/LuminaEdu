import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, onSnapshot, updateDoc, deleteDoc, setDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
let formattingTargetMode = "";
let currentActiveEditorModeType = "visual";
let capturedWindowSavedRangeNode = null;

window.executeAdminGatewayUnlockEngine = function() {
    const entered = document.getElementById('adminSecretKey').value.trim();
    if(!entered) return;

    if(entered === "LuminaAdmin@2026") {
        sessionStorage.setItem("admin_token", "active_root");
        verifyPreExistingSession();
        window.spawnPremiumToastAlert("Unlocked", "Console loaded successfully.", "success");
    } else {
        window.spawnPremiumToastAlert("Denied", "Invalid Master Security Token Key.", "error");
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
    toast.className = `fixed top-5 left-1/2 transform -translate-x-1/2 z-[200] max-w-sm w-full mx-4 bg-white border p-4 rounded-2xl shadow-2xl flex items-start gap-3 transition-all duration-300 opacity-100 translate-y-0 ${type==='error'?'border-rose-200 bg-rose-50 text-rose-800':'border-emerald-200 bg-emerald-50 text-emerald-800'}`;
    setTimeout(() => { toast.classList.add('opacity-0','pointer-events-none'); }, 3500);
};

window.executeBuildCustomPageNodeData = async function() {
    const slug = document.getElementById('pageSlug').value.trim();
    const content = document.getElementById('pageContent').value.trim();
    
    if(!slug || !content) {
        window.spawnPremiumToastAlert("Missing Data", "Please fill Page Route Slug and Markup fields.", "error");
        return;
    }

    try {
        await addDoc(collection(db, "created_pages"), {
            slug: slug,
            content: content,
            timestamp: Date.now()
        });
        window.spawnPremiumToastAlert("Deployed", `Custom dynamic page "/${slug}" built successfully!`, "success");
        document.getElementById('pageSlug').value = "";
        document.getElementById('pageContent').value = "";
    } catch(e) { window.spawnPremiumToastAlert("Error", e.message, "error"); }
};

window.togglePostInputWorkspaceMode = function(mode) {
    currentActiveEditorModeType = mode;
    const visualEditorBox = document.getElementById('visualEditorContainerBox');
    const rawHtmlTextArea = document.getElementById('aDesc');
    const visualFieldsBox = document.getElementById('workspaceVisualBlockContainer');
    const labelLabel = document.getElementById('mainContentTextBoxLabel');

    document.getElementById('modeVisualBtn').className = mode === 'visual' ? 'tab-active px-3 py-1 text-xs font-bold rounded-lg' : 'px-3 py-1 text-xs font-bold rounded-lg';
    document.getElementById('modeHtmlBtn').className = mode === 'html' ? 'tab-active px-3 py-1 text-xs font-bold rounded-lg' : 'px-3 py-1 text-xs font-bold rounded-lg';

    if (mode === 'html') {
        visualFieldsBox?.classList.add('hidden');
        visualEditorBox?.classList.add('hidden');
        rawHtmlTextArea?.classList.remove('hidden');
        if (labelLabel) labelLabel.innerText = "📋 Paste / Manage Complete Custom Native HTML Content Code:";
        rawHtmlTextArea.value = document.getElementById('richVisualEditorField').innerHTML;
    } else {
        visualFieldsBox?.classList.remove('hidden');
        visualEditorBox?.classList.remove('hidden');
        rawHtmlTextArea?.classList.add('hidden');
        if (labelLabel) labelLabel.innerText = "Description Box Area Blueprint";
        document.getElementById('richVisualEditorField').innerHTML = rawHtmlTextArea.value;
    }
};

window.executeMasterFormatStyleCommand = function(mode) {
    formattingTargetMode = mode;
    const activeSelection = window.getSelection();
    if (activeSelection.rangeCount > 0) {
        capturedWindowSavedRangeNode = activeSelection.getRangeAt(0).cloneRange();
    }

    if (mode === 'color') {
        executeApplyInlineStyleTagInjection(document.getElementById('masterTextHexColorPicker').value);
        return;
    }

    const overlay = document.getElementById('premiumRichFormatModalOverlay');
    const input = document.getElementById('premiumModalInputField');
    const title = document.getElementById('premiumModalTitleLabel');
    const subLabel = document.getElementById('premiumModalSubLabel');
    
    if(!overlay || !input) return;
    input.value = mode === 'link' ? 'https://' : mode === 'img' ? 'https://' : '16px';
    
    if(mode === 'link') { title.innerText = "🔗 Append Action Target Url Link"; subLabel.innerText = "Provide clean web routing path:"; }
    else if(mode === 'img') { title.innerText = "🖼️ Map Custom Graphics Image URL"; subLabel.innerText = "Paste public absolute image resource link:"; }
    else if(mode === 'size') { title.innerText = "📐 Configure Selection Font Bounds"; subLabel.innerText = "Map text size in pixels (e.g., 20px):"; }
    
    overlay.classList.remove('hidden');
    setTimeout(() => { overlay.classList.remove('opacity-0'); input.focus(); }, 20);
};

window.closePremiumTextEditorModal = function(shouldApply) {
    const overlay = document.getElementById('premiumRichFormatModalOverlay');
    const input = document.getElementById('premiumModalInputField');
    if(!overlay) return;

    if (shouldApply && input && input.value.trim()) {
        executeApplyInlineStyleTagInjection(input.value.trim());
    }
    overlay.classList.add('hidden');
};

function executeApplyInlineStyleTagInjection(valuePayloadString) {
    if (!capturedWindowSavedRangeNode) return;
    const currentSelection = window.getSelection();
    currentSelection.removeAllRanges();
    currentSelection.addRange(capturedWindowSavedRangeNode);

    let createdMarkupElement = null;

    if (formattingTargetMode === 'link') {
        createdMarkupElement = document.createElement('a');
        createdMarkupElement.href = valuePayloadString;
        createdMarkupElement.target = "_blank";
        createdMarkupElement.style.cssText = "color:#2563eb;text-decoration:underline;font-weight:700;";
        createdMarkupElement.innerText = capturedWindowSavedRangeNode.toString() || "Link";
    } else if (formattingTargetMode === 'img') {
        createdMarkupElement = document.createElement('img');
        createdMarkupElement.src = valuePayloadString;
        createdMarkupElement.className = "max-w-full h-auto rounded-xl my-3 border block mx-auto shadow-sm";
    } else if (formattingTargetMode === 'color') {
        createdMarkupElement = document.createElement('span');
        createdMarkupElement.style.color = valuePayloadString;
        createdMarkupElement.style.fontWeight = "bold";
        createdMarkupElement.innerText = capturedWindowSavedRangeNode.toString() || "Text";
    } else if (formattingTargetMode === 'size') {
        createdMarkupElement = document.createElement('span');
        createdMarkupElement.style.fontSize = valuePayloadString;
        createdMarkupElement.style.fontWeight = "800";
        createdMarkupElement.style.display = "inline-block";
        createdMarkupElement.innerText = capturedWindowSavedRangeNode.toString() || "Text";
    }

    if (createdMarkupElement) {
        capturedWindowSavedRangeNode.deleteContents();
        capturedWindowSavedRangeNode.insertNode(createdMarkupElement);
    }
    
    capturedWindowSavedRangeNode = null;
    currentSelection.removeAllRanges();
}

window.publishDirectAdminNode = async function() {
    if (sessionStorage.getItem("admin_token") !== "active_root") return; 
    
    const editId = document.getElementById('adminTargetEditingId').value;
    const imgMode = document.getElementById('aImageVisibilityMode').value;
    
    let completeDescriptionPayload = "";
    if (currentActiveEditorModeType === 'html') {
        completeDescriptionPayload = document.getElementById('aDesc').value.trim();
    } else {
        const customVisualHtml = document.getElementById('richVisualEditorField').innerHTML;
        completeDescriptionPayload = `
            <div class="p-4 bg-indigo-50/60 border rounded-xl my-4 text-xs font-bold text-slate-600 shadow-sm">
                <p>💰 Application Fee: ${document.getElementById('aFees').value.trim() || 'Review Details'}</p>
                <p class="mt-1">🎓 Eligibility Matrix: ${document.getElementById('aElig').value.trim() || 'Review Details'}</p>
            </div>
            <div class="text-sm font-medium mt-2">${customVisualHtml}</div>`;
    }

    const postPayload = {
        title: document.getElementById('aTitle').value.trim(),
        authority: document.getElementById('aAuth').value.trim(),
        type: document.getElementById('aType').value,
        lastDate: document.getElementById('aLastDate').value.trim(),
        description: completeDescriptionPayload,
        imageVisibilityMode: imgMode, 
        postRenderFormat: currentActiveEditorModeType,
        approvalStatus: "Live"
    };

    try {
        if(editId) {
            await updateDoc(doc(db, "jobs", editId), postPayload);
            window.spawnPremiumToastAlert("Updated", "Post node modified inside database.", "success");
            window.clearAdminEditingFormFieldsState();
        } else {
            postPayload.timestamp = Date.now();
            await addDoc(collection(db, "jobs"), postPayload);
            window.spawnPremiumToastAlert("Live", "Post successfully broadcasted live.", "success");
            window.clearAdminEditingFormFieldsState();
        }
    } catch(e) { window.spawnPremiumToastAlert("Error", e.message, "error"); }
};

window.triggerAdminPostEditSelectMode = function(id) {
    const post = cachedJobsArray.find(j => j.id === id);
    if(!post) return;
    
    document.getElementById('adminTargetEditingId').value = id;
    document.getElementById('adminFormHeadlineLabel').innerText = "📝 Edit Selected Broadcast Node";
    document.getElementById('adminSubmitPrimaryActionBtn').innerText = "Commit Structural Changes 💾";
    document.getElementById('adminCancelEditNodeBtn').classList.remove('hidden');

    document.getElementById('aTitle').value = post.title || "";
    document.getElementById('aAuth').value = post.authority || "";
    document.getElementById('aType').value = post.type || "";
    document.getElementById('aLastDate').value = post.lastDate || "";
    document.getElementById('aImageVisibilityMode').value = post.imageVisibilityMode || "both";

    window.togglePostInputWorkspaceMode(post.postRenderFormat || "visual");
    
    if (post.postRenderFormat === 'html') {
        document.getElementById('aDesc').value = post.description || "";
    } else {
        document.getElementById('richVisualEditorField').innerHTML = post.description || "";
    }
};

window.clearAdminEditingFormFieldsState = function() {
    document.getElementById('adminTargetEditingId').value = "";
    document.getElementById('adminFormHeadlineLabel').innerText = "Create Direct Live Post Node";
    document.getElementById('adminSubmitPrimaryActionBtn').innerText = "Publish Content Node Live ⚡";
    document.getElementById('adminCancelEditNodeBtn').classList.add('hidden');
    window.togglePostInputWorkspaceMode("visual");
    
    document.getElementById('aTitle').value = ""; document.getElementById('aAuth').value = "";
    document.getElementById('aLastDate').value = ""; document.getElementById('aDesc').value = "";
    document.getElementById('richVisualEditorField').innerHTML = "";
    document.getElementById('aFees').value = ""; document.getElementById('aElig').value = "";
};

window.executeAddNewCategoryNode = async function() {
    const name = document.getElementById('newCatName').value.trim();
    const color = document.getElementById('newCatHex').value;
    if(!name) return;
    try {
        await setDoc(doc(db, "dynamic_categories", name), { name, hexColor: color });
        document.getElementById('newCatName').value = "";
        window.spawnPremiumToastAlert("Category Added", "New dynamic category badge active.", "success");
    } catch(e) { alert(e.message); }
};

window.executeRemoveCategoryNode = async function(id) {
    if(!confirm("Erase this category mapping node permanently?")) return;
    try {
        await deleteDoc(doc(db, "dynamic_categories", id));
        window.spawnPremiumToastAlert("Removed", "Category destroyed safely.", "error");
    } catch(e) { alert(e.message); }
};

window.executeSetGridLayoutColumnsNode = async function(columnStyleClass) {
    try {
        await setDoc(doc(db, "admin_settings", "layout_config"), { activeGridClass: columnStyleClass });
        window.spawnPremiumToastAlert("Layout Synced", `Responsive grid columns shifted to ${columnStyleClass}!`, "success");
    } catch(e) { alert(e.message); }
};

window.approvePostItemNode = async function(id) {
    try {
        await updateDoc(doc(db, "jobs", id), { approvalStatus: "Live" });
        window.spawnPremiumToastAlert("Approved", "Submission published to stream hub.", "success");
    } catch(e) { alert(e.message); }
};

window.rejectPostItemNode = async function(id) {
    try {
        await deleteDoc(doc(db, "jobs", id));
        window.spawnPremiumToastAlert("Purged", "Post erased cleanly from logs.", "error");
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
                <div class="p-2.5 bg-slate-50 border rounded-xl flex items-center justify-between text-xs gap-2">
                    <span class="font-bold text-slate-800 truncate" style="color: ${cat.hexColor}">● ${cat.name}</span>
                    <button onclick="window.executeRemoveCategoryNode('${cat.name}')" class="text-rose-600 font-bold hover:underline text-[11px]">Delete</button>
                </div>`;
        });
        selectElement.innerHTML = selectHtml;
        if(adminDeleteContainer) adminDeleteContainer.innerHTML = deleteHtml || `<p class="text-xs text-slate-400 text-center py-2">No category rules.</p>`;
    });

    onSnapshot(collection(db, "created_pages"), (snapshot) => {
        if(document.getElementById('statCustomPagesCount')) {
            document.getElementById('statCustomPagesCount').innerText = snapshot.size;
        }
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
                    <div class="p-3 bg-slate-50 border rounded-xl space-y-2 text-xs text-slate-800">
                        <h4 class="font-bold text-slate-800 leading-tight">${data.title}</h4>
                        <div class="flex gap-2">
                            <button onclick="window.approvePostItemNode('${id}')" class="bg-emerald-600 text-white px-3 py-1 rounded-lg font-bold text-[10px]">Approve</button>
                            <button onclick="window.rejectPostItemNode('${id}')" class="bg-rose-600 text-white px-3 py-1 rounded-lg font-bold text-[10px]">Reject</button>
                        </div>
                    </div>`;
            } else if(data.approvalStatus === 'Live') {
                totalLive++;
                editablePostsHTML += `
                    <div class="p-2.5 bg-slate-50 border rounded-xl flex items-center justify-between text-xs gap-2 text-slate-800">
                        <span class="font-bold text-slate-700 truncate flex-1">${data.title}</span>
                        <div class="flex gap-1.5">
                            <button onclick="window.triggerAdminPostEditSelectMode('${id}')" class="bg-indigo-600 text-white px-2 py-1 rounded-lg font-bold text-[10px]">Edit</button>
                            <button onclick="window.rejectPostItemNode('${id}')" class="text-rose-600 font-bold hover:underline text-[11px] px-1">Erase</button>
                        </div>
                    </div>`;
            }
        });
        
        if(document.getElementById('statTotalCount')) document.getElementById('statTotalCount').innerText = totalLive;
        if(document.getElementById('statPendingCount')) document.getElementById('statPendingCount').innerText = totalPending;
        
        const qBox = document.getElementById('adminApprovalQueueTargetList'); if(qBox) qBox.innerHTML = approvalQueueHTML || `<p class="text-xs text-slate-400 text-center py-4">No pending items.</p>`;
        const eBox = document.getElementById('adminLivePostsListEditableTargetStack'); if(eBox) eBox.innerHTML = editablePostsHTML || `<p class="text-xs text-slate-400 text-center py-4">No live feeds deployed.</p>`;
    });
}

function verifyPreExistingSession() {
    const sessionToken = sessionStorage.getItem("admin_token");
    if (sessionToken === "active_root") {
        document.getElementById('adminAuthCover').classList.add('hidden');
        
        const workspaceView = document.getElementById('adminConsoleWorkspace');
        workspaceView.style.setProperty('display', 'block', 'important');
        
        document.getElementById('adminLogoutBtn')?.classList.remove('hidden');
        startDatabaseListenersEngine();
    } else {
        document.getElementById("adminAuthCover").classList.remove("hidden");
    }
}

window.verifyPreExistingSession = verifyPreExistingSession;
window.addEventListener('DOMContentLoaded', verifyPreExistingSession);
