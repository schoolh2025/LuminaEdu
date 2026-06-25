import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 🔥 STEP 1: Apni real Firebase configuration keys yahan dhyan se check karein
const firebaseConfig = {
    apiKey: "AIzaSyA1...",
    authDomain: "luminaedu-portal.firebaseapp.com",
    projectId: "luminaedu-portal",
    storageBucket: "luminaedu-portal.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef..."
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Global Runtime Application States
let currentRoleKey = 'public';
let currentActiveView = 'public_jobs';
let jobCategoryFilter = 'All';
let targetedActivePostId = null; 

const mockUsers = {
    public: { name: "Guest Observer", role: "Public", badge: "Visitor", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" },
    user_scholar: { name: "User Scholar Team", role: "UserContributor", badge: "Registered Writer", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" },
    admin: { name: "Director Root", role: "Admin", badge: "Super Executive Panel", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" }
};

function updateIcons() { if (typeof lucide !== 'undefined') lucide.createIcons(); }

// SIDEBAR NAV ENGINE
function renderSidebarNav() {
    const currentUser = mockUsers[currentRoleKey];
    const nav = document.getElementById('navLinks');
    if(!nav) return;

    let html = `
        <button onclick="window.navigateView('public_jobs')" class="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${currentActiveView === 'public_jobs' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-white/30'}">
            <i data-lucide="briefcase" class="w-4 h-4"></i> Sarkari Board Hub
        </button>
    `;

    if (currentUser.role === 'UserContributor') {
        html += `<button onclick="window.navigateView('user_contributor_dashboard')" class="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${currentActiveView === 'user_contributor_dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-white/30'}"><i data-lucide="plus-circle" class="w-4 h-4"></i> Create New Post Entry</button>`;
    } else if (currentUser.role === 'Admin') {
        html += `<button onclick="window.navigateView('admin_dashboard')" class="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${currentActiveView === 'admin_dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-white/30'}"><i data-lucide="sliders" class="w-4 h-4"></i> Master System Console</button>`;
    }

    nav.innerHTML = html;
    document.getElementById('userBadge').innerHTML = `
        <img src="${currentUser.avatar}" class="w-9 h-9 rounded-full object-cover border border-white/60" alt="profile">
        <div class="overflow-hidden"><h4 class="text-xs font-bold text-slate-700 truncate">${currentUser.name}</h4><span class="inline-block bg-white/60 text-[10px] text-indigo-700 px-1.5 rounded font-bold">${currentUser.badge}</span></div>
    `;
    updateIcons();
}

// Global Execution Bindings (Window objects securely attached)
window.navigateView = function(viewName, targetId = null) {
    currentActiveView = viewName;
    if(targetId) targetedActivePostId = targetId;
    renderSidebarNav();
    renderMainContent();
};

window.switchRole = function(roleKey) {
    if (roleKey === 'admin') {
        // Non-blocking micro-timeout prevent thread locks inside browser layout engines
        setTimeout(() => {
            const token = prompt("🔒 Enter Secure Admin Authorization Token Key:");
            if (token !== "Admin@2026") { 
                alert("Clearance Denied."); 
                document.getElementById('roleSwitcher').value = currentRoleKey; 
                return; 
            }
            proceedSwitch(roleKey);
        }, 50);
    } else {
        proceedSwitch(roleKey);
    }
};

function proceedSwitch(roleKey) {
    currentRoleKey = roleKey;
    window.navigateView(mockUsers[roleKey].role === 'Public' ? 'public_jobs' : (mockUsers[roleKey].role === 'UserContributor' ? 'user_contributor_dashboard' : 'admin_dashboard'));
}

// MAIN CONTENT CANVAS ROUTER
async function renderMainContent() {
    const container = document.getElementById('mainContent');
    if(!container) return;

    if (currentActiveView === 'public_jobs') {
        container.innerHTML = '<div class="text-center py-6 text-xs font-bold text-indigo-600 animate-pulse">Synchronizing Cloud Data Node...</div>';
        try {
            const querySnapshot = await getDocs(collection(db, "jobs"));
            let jobs = []; querySnapshot.forEach((doc) => { if(doc.data().approvalStatus === 'Live') jobs.push({ id: doc.id, ...doc.data() }); });
            
            const catSnapshot = await getDocs(collection(db, "categories"));
            let coreCategories = ['All', 'Job', 'Admit Card', 'Result', 'Sarkari Yojna', 'Scholarship'];
            catSnapshot.forEach((doc) => { if(!coreCategories.includes(doc.data().name)) coreCategories.push(doc.data().name); });

            let filtersHTML = coreCategories.map(cat => `<button onclick="window.setJobFilter('${cat}')" class="px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all ${jobCategoryFilter === cat ? 'bg-slate-800 text-white' : 'bg-white/50 text-slate-600'}">${cat}</button>`).join('');
            const filteredJobs = jobs.filter(j => jobCategoryFilter === 'All' || j.type === jobCategoryFilter);

            let cardsHTML = filteredJobs.map(j => `
                <div class="glass-card rounded-2xl p-5 flex flex-col justify-between border border-white/40">
                    <div>
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 uppercase">${j.type}</span>
                            <span class="text-xs text-slate-500 font-bold">${j.lastDate || 'Active'}</span>
                        </div>
                        <h3 class="font-bold text-slate-800 text-base leading-snug mb-1.5 line-clamp-2">${j.title}</h3>
                        <p class="text-xs text-slate-500 font-semibold mb-4">🏛️ ${j.authority}</p>
                    </div>
                    <button onclick="window.navigateView('post_detailed_view', '${j.id}')" class="w-full bg-white border text-indigo-700 text-xs font-bold py-2.5 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">View Details & Apply →</button>
                </div>
            `).join('');

            container.innerHTML = `<div class="mb-6 flex flex-wrap gap-2 items-center">${filtersHTML}</div><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${cardsHTML || '<p class="text-xs font-semibold text-slate-500 py-6">No postings active inside this node path.</p>'}</div>`;
        } catch(e) {
            container.innerHTML = `<div class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-600">⚠️ Firebase Initialization Error: check your configuration parameters in app.js. Details: ${e.message}</div>`;
        }
    }

    else if (currentActiveView === 'post_detailed_view') {
        const docSnap = await getDoc(doc(db, "jobs", targetedActivePostId));
        if(!docSnap.exists()) return;
        const data = docSnap.data();

        container.innerHTML = `
            <button onclick="window.navigateView('public_jobs')" class="text-xs font-bold text-indigo-600 mb-4 inline-block">← Back to Feed</button>
            <div class="glass-panel rounded-2xl p-6 border space-y-6">
                <div class="border-b pb-4">
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase">${data.type}</span>
                    <h2 class="text-xl font-bold text-slate-800 mt-2">${data.title}</h2>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-white/40 p-4 rounded-xl border text-xs space-y-1"><h4 class="font-bold">📅 Dates</h4><p>Start: ${data.startDate}</p><p>Last Date: ${data.lastDate}</p></div>
                    <div class="bg-white/40 p-4 rounded-xl border text-xs space-y-1"><h4 class="font-bold">💸 Application Fees</h4><p class="whitespace-pre-line">${data.feesDetails}</p></div>
                </div>
                <div class="bg-white/30 p-4 rounded-xl border text-xs"><h4 class="font-bold mb-1">🎓 Eligibility & Age Criteria</h4><p class="whitespace-pre-line">${data.eligibility}</p></div>
                <div class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a href="${data.applyLink}" target="_blank" class="bg-indigo-600 text-white text-xs font-bold p-3 rounded-xl text-center shadow-md">Apply Online Direct Gateway</a>
                    <a href="${data.notificationLink}" target="_blank" class="bg-slate-700 text-white text-xs font-bold p-3 rounded-xl text-center shadow-md">Download Notification PDF</a>
                </div>
            </div>
        `;
    }

    else if (currentActiveView === 'user_contributor_dashboard') {
        const querySnapshot = await getDocs(collection(db, "jobs"));
        let historyHTML = "";
        querySnapshot.forEach((doc) => {
            if(doc.data().authorName === mockUsers[currentRoleKey].name) {
                let status = doc.data().approvalStatus;
                historyHTML += `<tr class="border-b text-xs"><td><span class="px-1.5 py-0.5 rounded bg-white border">${doc.data().type}</span></td><td class="p-2 truncate max-w-xs">${doc.data().title}</td><td><span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${status==='Live'?'bg-emerald-100 text-emerald-800':'bg-amber-100 text-amber-800'}">${status}</span></td></tr>`;
            }
        });

        container.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form class="lg:col-span-2 glass-panel p-5 rounded-2xl border space-y-4 shadow-lg" onsubmit="window.handleContributorPostSubmit(event)">
                    <h3 class="text-xs font-bold uppercase text-slate-700 border-b pb-2">Create New Submission Entry</h3>
                    <div class="grid grid-cols-2 gap-3">
                        <select id="postType" class="text-xs glass-input p-2.5 rounded-xl"><option value="Job">Job</option><option value="Admit Card">Admit Card</option><option value="Result">Result</option></select>
                        <input type="text" id="postAuth" required placeholder="Authority Board (e.g. SSC)" class="text-xs glass-input p-2.5 rounded-xl">
                    </div>
                    <input type="text" id="postTitle" required placeholder="Post Title Description" class="w-full text-xs glass-input p-2.5 rounded-xl">
                    <div class="grid grid-cols-2 gap-3">
                        <input type="text" id="postStart" placeholder="Start Date" class="text-xs glass-input p-2.5 rounded-xl">
                        <input type="text" id="postLast" placeholder="Last Date" class="text-xs glass-input p-2.5 rounded-xl">
                    </div>
                    <textarea id="postFees" rows="2" placeholder="Fees Scale Details..." class="w-full text-xs glass-input p-2.5 rounded-xl"></textarea>
                    <textarea id="postEligibility" rows="2" placeholder="Eligibility Matrix Criteria..." class="w-full text-xs glass-input p-2.5 rounded-xl"></textarea>
                    <div class="grid grid-cols-2 gap-3">
                        <input type="text" id="postApplyUrl" placeholder="Apply URL Link" class="text-xs glass-input p-2.5 rounded-xl">
                        <input type="text" id="postNotifyUrl" placeholder="Notification PDF URL" class="text-xs glass-input p-2.5 rounded-xl">
                    </div>
                    <button type="submit" class="w-full bg-indigo-600 text-white text-xs font-bold py-3 rounded-xl shadow-lg">Submit Architecture for Admin Review 🚀</button>
                </form>
                <div class="glass-panel p-4 rounded-2xl border"><h4 class="text-xs font-bold border-b pb-2 uppercase">Your Pipeline Submissions</h4><table class="w-full text-left"><tbody>${historyHTML || '<tr><td class="text-xs text-slate-400 py-4">No submissions logs tracked.</td></tr>'}</tbody></table></div>
            </div>
        `;
    }

    else if (currentActiveView === 'admin_dashboard') {
        const querySnapshot = await getDocs(collection(db, "jobs"));
        let rowsHTML = "";
        querySnapshot.forEach((doc) => {
            let j = doc.data();
            let isPending = j.approvalStatus === 'Pending for Approval';
            rowsHTML += `<tr class="border-b text-xs">
                <td class="p-3"><span class="px-2 py-0.5 bg-white rounded border text-[10px] font-bold uppercase">${j.type}</span></td>
                <td class="p-3 font-semibold max-w-xs truncate">${j.title}</td>
                <td class="p-3 font-bold text-slate-400">${j.authorName || 'System Admin'}</td>
                <td class="p-3 text-right space-x-2">
                    ${isPending ? `<button onclick="window.approvePostingNode('${doc.id}')" class="bg-emerald-600 text-white font-bold text-[10px] px-2 py-1 rounded-lg">✓ Approve Live</button>` : '<span class="text-emerald-600 font-bold">Live ✓</span>'}
                    <button onclick="window.deletePostingNode('${doc.id}')" class="text-rose-600 font-bold">✕ Delete</button>
                </td>
            </tr>`;
        });

        const catSnapshot = await getDocs(collection(db, "categories"));
        let catChips = ""; catSnapshot.forEach((doc) => { catChips += `<div class="inline-flex items-center gap-1.5 bg-white/60 border px-3 py-1 rounded-xl text-xs font-bold"><span>${doc.data().name}</span><button onclick="window.deleteCategoryConfigNode('${doc.id}')" class="text-rose-500">✕</button></div>`; });

        container.innerHTML = `
            <div class="space-y-6">
                <div class="glass-panel p-5 rounded-2xl border space-y-4">
                    <h4 class="text-xs font-bold uppercase text-slate-700">Category Master Management (Cloud Cloud Firestore)</h4>
                    <div class="flex flex-wrap gap-2">${catChips || '<span class="text-xs text-slate-400">No custom configurations.</span>'}</div>
                    <form class="flex items-center gap-2" onsubmit="window.handleAdminCategorySubmit(event)">
                        <input type="text" id="newAdminCatInput" required placeholder="Add Custom Global Category Element Node..." class="flex-1 text-xs glass-input p-2.5 rounded-xl">
                        <button type="submit" class="bg-indigo-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl">+ Inject Node</button>
                    </form>
                </div>
                <div class="glass-panel border rounded-2xl overflow-hidden shadow-xl">
                    <div class="p-4 bg-white/40 border-b flex items-center justify-between"><h4 class="text-xs font-bold uppercase text-slate-700">Database Ledger Systems Management</h4><button onclick="window.openJobCreateModal()" class="bg-slate-800 text-white text-[10px] px-3 py-1.5 rounded-lg">+ Write Entry</button></div>
                    <table class="w-full text-left"><tbody>${rowsHTML || '<tr><td class="p-3 text-xs text-slate-400">No records found.</td></tr>'}</tbody></table>
                </div>
            </div>
        `;
    }
    updateIcons();
}

window.setJobFilter = function(category) { jobCategoryFilter = category; renderMainContent(); };

// WRITE PIPELINES TO FIREBASE
window.handleContributorPostSubmit = async function(e) {
    e.preventDefault();
    await addDoc(collection(db, "jobs"), {
        type: document.getElementById('postType').value,
        authority: document.getElementById('postAuth').value.trim(),
        title: document.getElementById('postTitle').value.trim(),
        startDate: document.getElementById('postStart').value.trim(),
        lastDate: document.getElementById('postLast').value.trim(),
        feesDetails: document.getElementById('postFees').value.trim(),
        eligibility: document.getElementById('postEligibility').value.trim(),
        applyLink: document.getElementById('postApplyUrl').value.trim() || "#",
        notificationLink: document.getElementById('postNotifyUrl').value.trim() || "#",
        approvalStatus: 'Pending for Approval',
        authorName: mockUsers[currentRoleKey].name,
        status: 'Apply Now'
    });
    alert("🎉 Post locked inside approval queue!");
    window.navigateView('user_contributor_dashboard');
};

window.handleAdminCategorySubmit = async function(e) {
    e.preventDefault();
    const val = document.getElementById('newAdminCatInput').value.trim();
    if(!val) return;
    await addDoc(collection(db, "categories"), { name: val });
    renderMainContent();
};

window.deleteCategoryConfigNode = async function(id) {
    await deleteDoc(doc(db, "categories", id));
    renderMainContent();
};

window.approvePostingNode = async function(id) {
    await updateDoc(doc(db, "jobs", id), { approvalStatus: 'Live' });
    renderMainContent();
};

window.deletePostingNode = async function(id) {
    await deleteDoc(doc(db, "jobs", id));
    renderMainContent();
};

window.openJobCreateModal = async function() {
    const catSnapshot = await getDocs(collection(db, "categories"));
    let coreCategories = ['Job', 'Admit Card', 'Result', 'Sarkari Yojna', 'Scholarship'];
    catSnapshot.forEach((doc) => { coreCategories.push(doc.data().name); });
    let optionsHTML = coreCategories.map(c => `<option value="${c}">${c}</option>`).join('');

    document.getElementById('modalContainer').innerHTML = `
        <div class="p-5 border-b bg-white/20 flex items-center justify-between"><h3 class="font-bold text-sm text-slate-800">Direct Write Entry</h3><button onclick="window.toggleModalVisibility(false)">✕</button></div>
        <form class="p-5 space-y-3" onsubmit="window.handleAdminDirectJobSubmit(event)">
            <select id="admType" class="w-full text-xs glass-input p-2.5 rounded-xl">${optionsHTML}</select>
            <input type="text" id="admAuth" required placeholder="Authority Board" class="text-xs glass-input p-2.5 w-full rounded-xl">
            <input type="text" id="admTitle" required placeholder="Listing Title Header" class="text-xs glass-input p-2.5 w-full rounded-xl">
            <input type="text" id="admStart" placeholder="Start Date" class="text-xs glass-input p-2.5 w-full rounded-xl">
            <input type="text" id="admLast" placeholder="Last Apply Date" class="text-xs glass-input p-2.5 w-full rounded-xl">
            <textarea id="admFees" placeholder="Fees Guidelines..." class="text-xs glass-input p-2.5 w-full rounded-xl"></textarea>
            <textarea id="admElig" placeholder="Eligibility Rules..." class="text-xs glass-input p-2.5 w-full rounded-xl"></textarea>
            <input type="text" id="admApply" placeholder="Apply Link" class="text-xs glass-input p-2.5 w-full rounded-xl">
            <input type="text" id="admNotify" placeholder="Notification Link" class="text-xs glass-input p-2.5 w-full rounded-xl">
            <button type="submit" class="w-full bg-indigo-600 text-white font-bold text-xs py-3 rounded-xl">Broadcast Live 🚀</button>
        </form>
    `;
    window.toggleModalVisibility(true);
};

window.handleAdminDirectJobSubmit = async function(e) {
    e.preventDefault();
    const type = document.getElementById('admType').value;
    await addDoc(collection(db, "jobs"), {
        type,
        authority: document.getElementById('admAuth').value.trim(),
        title: document.getElementById('admTitle').value.trim(),
        startDate: document.getElementById('admStart').value.trim(),
        lastDate: document.getElementById('admLast').value.trim(),
        feesDetails: document.getElementById('admFees').value.trim(),
        eligibility: document.getElementById('admElig').value.trim(),
        applyLink: document.getElementById('admApply').value.trim() || "#",
        notificationLink: document.getElementById('admNotify').value.trim() || "#",
        status: type === 'Job' ? 'Apply Now' : (type === 'Admit Card' ? 'Download' : 'View Result'),
        approvalStatus: 'Live',
        authorName: 'System Admin'
    });
    window.toggleModalVisibility(false);
    renderMainContent();
};

window.toggleModalVisibility = function(show = true) {
    const modalOverlay = document.getElementById('modalOverlay');
    if(show) { modalOverlay.classList.remove('hidden'); setTimeout(() => { modalOverlay.classList.remove('opacity-0'); document.getElementById('modalContainer').classList.remove('scale-95'); }, 10); }
    else { modalOverlay.classList.add('opacity-0'); document.getElementById('modalContainer').classList.add('scale-95'); setTimeout(() => modalOverlay.classList.add('hidden'), 300); }
};

// LIFECYCLE INITIALIZER BOOTSTRAP
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('roleSwitcher').addEventListener('change', (e) => window.switchRole(e.target.value));
    window.navigateView('public_jobs');
});
