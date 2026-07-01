import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, onSnapshot, updateDoc, deleteDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
let cachedHybridAssetsArray = [];
let currentActiveEditorModeType = "visual";
let capturedWindowSavedRangeNode = null;
let formattingTargetMode = "";

window.executeAdminGatewayUnlockEngine = function() {
    const entered = document.getElementById('adminSecretKey').value.trim();
    if(entered === "LuminaAdmin@2026") {
        sessionStorage.setItem("admin_token", "active_root");
        verifyPreExistingSession();
        window.spawnPremiumToastAlert("Unlocked", "Console workspace active.", "success");
    } else {
        window.spawnPremiumToastAlert("Denied", "Invalid Token Sequence Keys.", "error");
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
    toast.className = `fixed top-5 left-1/2 transform -translate-x-1/2 z-[9999] max-w-sm w-full mx-4 bg-white border p-4 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 opacity-100 translate-y-0 ${type==='error'?'border-rose-200 bg-rose-50 text-rose-800':'border-emerald-200 bg-emerald-50 text-emerald-800'}`;
    setTimeout(() => { toast.className = "hidden"; }, 3500);
};

// 🌟 POPUP FIX COMPLETION ROUTINE MAPPING NODES
window.closePremiumTextEditorModal = function(shouldApply) {
    const overlay = document.getElementById('premiumRichFormatModalOverlay');
    const input = document.getElementById('premiumModalInputField');
    if(!overlay) return;

    if (shouldApply && input && input.value.trim()) {
        executeApplyInlineStyleTagInjection(input.value.trim());
    }
    
    // Clear styles attributes forcefully to trigger quick clean removal layout blocks
    overlay.classList.add('hidden');
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
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
    if(!overlay || !input) return;

    input.value = (mode === 'link' || mode === 'img') ? 'https://' : '16px';
    overlay.classList.remove('hidden');
    overlay.style.opacity = "1";
    overlay.style.pointerEvents = "auto";
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
        createdMarkupElement.innerText = capturedWindowSavedRangeNode.toString() || "Text";
    } else if (formattingTargetMode === 'size') {
        createdMarkupElement = document.createElement('span');
        createdMarkupElement.style.fontSize = valuePayloadString;
        createdMarkupElement.style.fontWeight = "800";
        createdMarkupElement.innerText = capturedWindowSavedRangeNode.toString() || "Heading";
    }

    if (createdMarkupElement) {
        capturedWindowSavedRangeNode.deleteContents();
        capturedWindowSavedRangeNode.insertNode(createdMarkupElement);
    }
    capturedWindowSavedRangeNode = null;
    currentSelection.removeAllRanges();
}

// 🌟 DYNAMIC PIPELINE ENGAGEMENT ENGINE (SUPPORTS FULL CRUD LABELS MANAGEMENT CONTROL)
window.executeDeployHybridModulePipeline = async function() {
    const slug = document.getElementById('pageSlug').value.trim();
    const toolUrl = document.getElementById('toolUrlField').value.trim();
    const location = document.querySelector('input[name="placementTargetSelector"]:checked').value;
    const themeColor = document.getElementById('toolPageThemeHexColor').value;
    const moduleType = document.getElementById('moduleDeploymentEngineType').value;
    const content = document.getElementById('pageContent').value.trim();

    if(!slug) return window.spawnPremiumToastAlert("Missing Label", "Provide title/slug address text logs", "error");

    const payload = {
        slug: slug,
        title: slug,
        url: toolUrl || "#",
        placementLocation: location,
        customColorHex: themeColor,
        moduleType: moduleType,
        content: content,
        timestamp: Date.now()
    };

    try {
        const collectionTargetName = (moduleType === 'tool') ? "pdf_tools" : "created_pages";
        await addDoc(collection(db, collectionTargetName), payload);
        window.spawnPremiumToastAlert("Live Asset Deployed", `Compiled successfully as ${moduleType.toUpperCase()} node!`, "success");
        
        // Clear fields state arrays
        document.getElementById('pageSlug').value = "";
        document.getElementById('toolUrlField').value = "";
        document.getElementById('pageContent').value = "";
    } catch(e) { window.spawnPremiumToastAlert("Pipeline Error", e.message, "error"); }
};

window.executeDeleteTargetAssetNode = async function(collectionName, documentId) {
    if(!confirm("Are you completely sure you want to drop and destroy this asset index parameters?")) return;
    try {
        await deleteDoc(doc(db, collectionName, documentId));
        window.spawnPremiumToastAlert("Removed", "Asset dropped successfully.", "success");
    } catch(e) { alert(e.message); }
};

window.togglePostInputWorkspaceMode = function(mode) {
    currentActiveEditorModeType = mode;
    const visualEditorBox = document.getElementById('visualEditorContainerBox');
    const rawHtmlTextArea = document.getElementById('aDesc');
    const visualFieldsBox = document.getElementById('workspaceVisualBlockContainer');

    document.getElementById('modeVisualBtn').className = mode === 'visual' ? 'tab-active px-3 py-1 text-xs font-bold rounded-lg' : 'px-3 py-1 text-xs font-bold rounded-lg';
    document.getElementById('modeHtmlBtn').className = mode === 'html' ? 'tab-active px-3 py-1 text-xs font-bold rounded-lg' : 'px-3 py-1 text-xs font-bold rounded-lg';

    if (mode === 'html') {
        visualFieldsBox?.classList.add('hidden');
        visualEditorBox?.classList.add('hidden');
        rawHtmlTextArea?.classList.remove('hidden');
        rawHtmlTextArea.value = document.getElementById('richVisualEditorField').innerHTML;
    } else {
        visualFieldsBox?.classList.remove('hidden');
        visualEditorBox?.classList.remove('hidden');
        rawHtmlTextArea?.classList.add('hidden');
        document.getElementById('richVisualEditorField').innerHTML = rawHtmlTextArea.value;
    }
};

window.publishDirectAdminNode = async function() {
    const editId = document.getElementById('adminTargetEditingId').value;
    let completeDescriptionPayload = (currentActiveEditorModeType === 'html') 
        ? document.getElementById('aDesc').value.trim() 
        : `<div class="p-4 bg-indigo-50/60 border rounded-xl my-4 text-xs font-bold text-slate-600"><p>💰 Fees: ${document.getElementById('aFees').value.trim()}</p><p class='mt-1'>🎓 Eligibility: ${document.getElementById('aElig').value.trim()}</p></div><div class="text-sm font-medium mt-2">${document.getElementById('richVisualEditorField').innerHTML}</div>`;

    const postPayload = {
        title: document.getElementById('aTitle').value.trim(),
        authority: document.getElementById('aAuth').value.trim(),
        type: document.getElementById('aType').value,
        lastDate: document.getElementById('aLastDate').value.trim(),
        description: completeDescriptionPayload,
        imageVisibilityMode: document.getElementById('aImageVisibilityMode').value, 
        postRenderFormat: currentActiveEditorModeType,
        approvalStatus: "Live"
    };

    try {
        if(editId) {
            await updateDoc(doc(db, "jobs", editId), postPayload);
            window.spawnPremiumToastAlert("Updated", "Broadcast posting successfully re-indexed.", "success");
            window.clearAdminEditingFormFieldsState();
        } else {
            postPayload.timestamp = Date.now();
            await addDoc(collection(db, "jobs"), postPayload);
            window.spawnPremiumToastAlert("Published Live", "Broadcasting sequence synced.", "success");
            window.clearAdminEditingFormFieldsState();
        }
    } catch(e) { window.spawnPremiumToastAlert("Error Syncing", e.message, "error"); }
};

window.triggerAdminPostEditSelectMode = function(id) {
    const post = cachedJobsArray.find(j => j.id === id);
    if(!post) return;
    document.getElementById('adminTargetEditingId').value = id;
    document.getElementById('aTitle').value = post.title || "";
    document.getElementById('aAuth').value = post.authority || "";
    document.getElementById('aType').value = post.type || "";
    document.getElementById('aLastDate').value = post.lastDate || "";
    window.togglePostInputWorkspaceMode(post.postRenderFormat || "visual");
    document.getElementById('richVisualEditorField').innerHTML = post.description || "";
};

window.clearAdminEditingFormFieldsState = function() {
    document.getElementById('adminTargetEditingId').value = "";
    document.getElementById('aTitle').value = ""; document.getElementById('aAuth').value = "";
    document.getElementById('aLastDate').value = ""; document.getElementById('aDesc').value = "";
    document.getElementById('richVisualEditorField').innerHTML = "";
};

window.executeAddNewCategoryNode = async function() {
    const name = document.getElementById('newCatName').value.trim();
    const color = document.getElementById('newCatHex').value;
    if(!name) return;
    try { await setDoc(doc(db, "dynamic_categories", name), { name, hexColor: color }); document.getElementById('newCatName').value = ""; } catch(e) { alert(e.message); }
};

window.executeRemoveCategoryNode = async function(id) {
    if(!confirm("Drop badge category index?")) return;
    try { await deleteDoc(doc(db, "dynamic_categories", id)); } catch(e) { alert(e.message); }
};

window.executeSetGridLayoutColumnsNode = async function(columnStyleClass) {
    try { await setDoc(doc(db, "admin_settings", "layout_config"), { activeGridClass: columnStyleClass }); window.spawnPremiumToastAlert("Layout Shifted", "Columns map rearranged.", "success"); } catch(e) { alert(e.message); }
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
            deleteHtml += `<div class="p-2 bg-slate-50 border rounded-xl flex items-center justify-between text-xs font-bold"><span style="color:${cat.hexColor}">● ${cat.name}</span><button onclick="window.executeRemoveCategoryNode('${cat.name}')" class="text-rose-600">✕</button></div>`;
        });
        selectElement.innerHTML = selectHtml;
        if(adminDeleteContainer) adminDeleteContainer.innerHTML = deleteHtml;
    });

    // 🌟 REALTIME MONITORING MERGED RENDERING LIST DECKS FOR DYNAMIC CRUD CONTROLS
    onSnapshot(collection(db, "pdf_tools"), (snapshotTools) => {
        const targetContainer = document.getElementById('adminLiveHybridAssetsMonitoringDeck');
        if(!targetContainer) return;
        let deckHtml = "";

        snapshotTools.forEach(docSnap => {
            const asset = docSnap.data();
            deckHtml += `
                <div class="p-2 bg-slate-50 border rounded-xl flex items-center justify-between text-[11px] font-bold shadow-sm">
                    <span style="color:${asset.customColorHex};">🛠️ TOOL: ${asset.slug} (${asset.placementLocation})</span>
                    <button onclick="window.executeDeleteTargetAssetNode('pdf_tools', '${docSnap.id}')" class="text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Delete ✕</button>
                </div>`;
        });

        // Pull created custom rendering channels logs to complement rows view
        onSnapshot(collection(db, "created_pages"), (snapshotPages) => {
            let completeHtml = deckHtml;
            snapshotPages.forEach(pSnap => {
                const page = pSnap.data();
                completeHtml += `
                    <div class="p-2 bg-slate-50 border rounded-xl flex items-center justify-between text-[11px] font-bold shadow-sm">
                        <span style="color:${page.customColorHex || '#6b21a8'};">📄 PAGE: ${page.slug} (${page.placementLocation})</span>
                        <button onclick="window.executeDeleteTargetAssetNode('created_pages', '${pSnap.id}')" class="text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Delete ✕</button>
                    </div>`;
            });
            targetContainer.innerHTML = completeHtml || `<p class="text-[10px] font-bold text-slate-400 p-2">No custom objects built yet.</p>`;
            if(document.getElementById('statCustomPagesCount')) document.getElementById('statCustomPagesCount').innerText = snapshotPages.size + snapshotTools.size;
        });
    });

    onSnapshot(collection(db, "jobs"), (snapshot) => {
        cachedJobsArray = []; let editablePostsHTML = ""; let totalLive = 0; let totalPending = 0;
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            cachedJobsArray.push({ id: docSnap.id, ...data });
            if(data.approvalStatus === 'Live') {
                totalLive++;
                editablePostsHTML += `<div class="p-2 bg-slate-50 border rounded-xl flex items-center justify-between text-xs font-bold"><span class="truncate flex-1">💼 ${data.title}</span><button onclick="window.triggerAdminPostEditSelectMode('${docSnap.id}')" class="bg-indigo-600 text-white px-2 py-1 rounded font-bold text-[10px]">Edit ✏️</button></div>`;
            } else { totalPending++; }
        });
        if(document.getElementById('statTotalCount')) document.getElementById('statTotalCount').innerText = totalLive;
        if(document.getElementById('statPendingCount')) document.getElementById('statPendingCount').innerText = totalPending;
        if(document.getElementById('adminLivePostsListEditableTargetStack')) document.getElementById('adminLivePostsListEditableTargetStack').innerHTML = editablePostsHTML;
    });
}

function verifyPreExistingSession() {
    if (sessionStorage.getItem("admin_token") === "active_root") {
        document.getElementById('adminAuthCover')?.classList.add('hidden');
        const workspaceView = document.getElementById('adminConsoleWorkspace');
        if(workspaceView) workspaceView.style.setProperty('display', 'block', 'important');
        startDatabaseListenersEngine();
    }
}
window.verifyPreExistingSession = verifyPreExistingSession;
window.addEventListener('DOMContentLoaded', verifyPreExistingSession);
