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

// Encryption Unlock Protocol
const unlockBtn = document.getElementById('unlockAdminBtn');
if(unlockBtn) {
    unlockBtn.addEventListener('click', () => {
        const key = document.getElementById('adminSecretKey').value.trim();
        if(key === "LuminaAdmin@2026") {
            sessionStorage.setItem("admin_token", "active_root");
            renderWorkspaceState();
        } else { alert("❌ ACCESS DENIED: Invalid Root Passkey Signature Node."); }
    });
}

function renderWorkspaceState() {
    if(sessionStorage.getItem("admin_token") === "active_root") {
        document.getElementById('adminAuthCover').classList.add('hidden');
        document.getElementById('adminConsoleWorkspace').classList.remove('hidden');
        initDatabaseListeners();
    }
}

// Direct Publish Node
document.getElementById('adminPublishBtn')?.addEventListener('click', async () => {
    const data = {
        title: document.getElementById('aTitle').value.trim(),
        authority: document.getElementById('aAuth').value.trim(),
        type: document.getElementById('aType').value.trim(),
        lastDate: document.getElementById('aLastDate').value.trim(),
        approvalStatus: "Live",
        timestamp: Date.now()
    };
    try {
        await addDoc(collection(db, "jobs"), data);
        alert("⚡ Front-page par instant live ho gaya!");
        document.getElementById('aTitle').value = "";
    } catch(e) { alert(e.message); }
});

// 🌟 DYNAMIC ADD PAGES HANDLER ENGINE
document.getElementById('createNewPageBtn')?.addEventListener('click', async () => {
    const slug = document.getElementById('pageSlug').value.trim();
    const bodyContent = document.getElementById('pageContent').value.trim();
    if(!slug || !bodyContent) return alert("Slug aur Content dono bharna mandatory hai!");
    
    try {
        await addDoc(collection(db, "created_pages"), {
            slug: slug,
            content: bodyContent,
            createdTime: Date.now()
        });
        alert(`🎉 Custom Page "${slug}" backend me create kar di gayi hai!`);
        document.getElementById('pageSlug').value = "";
        document.getElementById('pageContent').value = "";
    } catch(e) { alert(e.message); }
});

function initDatabaseListeners() {
    onSnapshot(collection(db, "jobs"), (snapshot) => {
        const queueBox = document.getElementById('adminQueueStack');
        let html = "";
        snapshot.forEach(d => {
            const data = d.data(); const id = d.id;
            if(data.approvalStatus === "Pending") {
                html += `
                    <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                        <h4 class="font-bold text-white leading-tight">${data.title}</h4>
                        <p class="text-[10px] text-slate-400">Category: ${data.type} | Last Date: ${data.lastDate}</p>
                        <div class="flex gap-2 pt-1">
                            <button onclick="window.approveNode('${id}')" class="bg-emerald-600 text-white px-3 py-1 rounded font-bold text-[10px]">Approve & Live</button>
                            <button onclick="window.rejectNode('${id}')" class="bg-rose-600 text-white px-3 py-1 rounded font-bold text-[10px]">Reject</button>
                        </div>
                    </div>`;
            }
        });
        queueBox.innerHTML = html || `<p class="text-xs text-slate-500 text-center py-4">No submissions pending audit nodes.</p>`;
    });
}

window.approveNode = async function(id) {
    try { await updateDoc(doc(db, "jobs", id), { approvalStatus: "Live" }); } catch(e) { alert(e.message); }
};
window.rejectNode = async function(id) {
    try { await deleteDoc(doc(db, "jobs", id)); } catch(e) { alert(e.message); }
};

document.getElementById('adminLogoutBtn')?.addEventListener('click', () => {
    sessionStorage.clear();
    window.location.reload();
});

window.addEventListener('DOMContentLoaded', renderWorkspaceState);
