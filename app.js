import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 🔥 STEP 1: Firebase configuration keys exchange area layer blocks placeholders
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

// Global Runtime Application Configurations States Indicators
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

// INITIAL NAVIGATION SYSTEM LINKS INJECTION LAYOUT MODULES
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

window.navigateView = function(viewName, targetId = null) {
    currentActiveView = viewName;
    if(targetId) targetedActivePostId = targetId;
    renderSidebarNav();
    renderMainContent();
};

window.switchRole = function(roleKey) {
    if (roleKey === 'admin') {
        const token = prompt("🔒 Enter Secure Admin Authorization Token Key:");
        if (token !== "Admin@2026") { alert("Clearance Denied."); document.getElementById('roleSwitcher').value = currentRoleKey; return; }
    }
    currentRoleKey = roleKey;
    window.navigateView(mockUsers[roleKey].role === 'Public' ? 'public_jobs' : (mockUsers[roleKey].role === 'UserContributor' ? 'user_contributor_dashboard' : 'admin_dashboard'));
};

// DYNAMIC GLOBAL CORE DESKTOP WORKSPACE RENDERING CANVAS CONSOLE FLOW
async function renderMainContent() {
    const container = document.getElementById('mainContent');
    if(!container) return;

    // A. PUBLIC DISPLAYS VIEW MATRIX LISTINGS PATHWAYS
    if (currentActiveView === 'public_jobs') {
        container.innerHTML = '<div class="text-center py-6 text-xs font-bold text-indigo-600 animate-pulse">Synchronizing Data Collections Matrix with Google Firebase Cloud Layer...</div>';
        
        const querySnapshot = await getDocs(collection(db, "jobs"));
        let jobs = []; querySnapshot.forEach((doc) => { if(doc.data().approvalStatus === 'Live') jobs.push({ id: doc.id, ...doc.data() }); });
        
        const catSnapshot = await getDocs(collection(db, "categories"));
        let coreCategories = ['All', 'Job', 'Admit Card', 'Result', 'Sarkari Yojna', 'Scholarship'];
        catSnapshot.forEach((doc) => { if(!coreCategories.includes(doc.data().name)) coreCategories.push(doc.data().name); });

        let filtersHTML = coreCategories.map(cat => `<button onclick="window.setJobFilter('${cat}')" class="px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all ${jobCategoryFilter === cat ? 'bg-slate-800 text-white border-slate-800 shadow-sm' : 'bg-white/50 text-slate-600 hover:bg-white/80'}">${cat}</button>`).join('');
        const filteredJobs = jobs.filter(j => jobCategoryFilter === 'All' || j.type === jobCategoryFilter);

        let cardsHTML = filteredJobs.map(j => `
            <div class="glass-card rounded-2xl p-5 flex flex-col justify-between border border-white/40">
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 uppercase tracking-wide">${j.type}</span>
                        <span class="text-xs text-slate-500 font-bold">${j.lastDate || 'Active'}</span>
                    </div>
                    <h3 class="font-bold text-slate-800 text-base leading-snug mb-1.5 line-clamp-2">${j.title}</h3>
                    <p class="text-xs text-slate-500 font-semibold mb-4 flex items-center gap-1">🏛️ ${j.authority}</p>
                </div>
                <button onclick="window.navigateView('post_detailed_view', '${j.id}')" class="w-full bg-white border border-white text-indigo-700 text-xs font-bold py-2.5 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-1">View Post Details & Apply <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i></button>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="mb-6 flex flex-wrap gap-2 items-center">${filtersHTML}</div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${cardsHTML || '<p class="text-xs font-semibold text-slate-500 py-6">No postings active inside this node path.</p>'}</div>
        `;
    }

    // B. FULL INTERACTIVE EXTENSIVE JOB POST DETAILED VIEW COMPONENT LAYER
    else if (currentActiveView === 'post_detailed_view') {
        container.innerHTML = '<div class="text-xs font-bold text-slate-500 text-center py-6">Fetching Post Document Elements Buffer Matrices...</div>';
        const docRef = doc(db, "jobs", targetedActivePostId);
        const docSnap = await getDoc(docRef);
        
        if(!docSnap.exists()) { container.innerHTML = '<p class="text-xs font-bold text-rose-500">Post data tracking vector missing.</p>'; return; }
        const data = docSnap.data();

        container.innerHTML = `
            <button onclick="window.navigateView('public_jobs')" class="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline mb-4 cursor-pointer"><i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Main Post Feed</button>
            <div class="glass-panel rounded-2xl p-6 border border-white/40 shadow-xl space-y-6">
                <div class="border-b border-white/20 pb-4">
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border uppercase tracking-wider">${data.type}</span>
                    <h2 class="text-xl font-bold text-slate-800 mt-2 leading-snug">${data.title}</h2>
                    <p class="text-xs text-slate-500 font-semibold mt-1">Authority Management: <strong>${data.authority}</strong></p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-white/40 p-4 rounded-xl border border-white/50 text-xs font-medium space-y-2">
                        <h4 class="font-bold text-slate-800 uppercase tracking-wider border-b pb-1 flex items-center gap-1"><i data-lucide="calendar" class="w-4 h-4 text-indigo-600"></i> Important Execution Dates</h4>
                        <p class="flex justify-between"><span>Application Start Date:</span> <strong class="text-slate-800">${data.startDate || 'N/A'}</strong></p>
                        <p class="flex justify-between"><span>Online Apply Last Date:</span> <strong class="text-rose-600">${data.lastDate || 'N/A'}</strong></p>
                    </div>
                    <div class="bg-white/40 p-4 rounded-xl border border-white/50 text-xs font-medium space-y-2">
                        <h4 class="font-bold text-slate-800 uppercase tracking-wider border-b pb-1 flex items-center gap-1"><i data-lucide="indian-rupee" class="w-4 h-4 text-emerald-600"></i> Application Fees Ledger</h4>
                        <p class="whitespace-pre-line leading-relaxed text-slate-700">${data.feesDetails || 'Fee details not specified.'}</p>
                    </div>
                </div>

                <div class="bg-white/30 p-4 rounded-xl border text-xs font-medium space-y-2">
                    <h4 class="font-bold text-slate-800 uppercase tracking-wider border-b pb-1 flex items-center gap-1"><i data-lucide="scroll-text" class="w-4 h-4 text-indigo-600"></i> Age Criteria & Qualification Parameters</h4>
                    <p class="whitespace-pre-line leading-relaxed text-slate-700">${data.eligibility || 'Check official data notification blueprints inside the ledger nodes.'}</p>
                </div>

                <div class="glass-panel rounded-xl overflow-hidden border border-white/50">
                    <div class="bg-slate-800 text-white p-3 text-xs font-bold tracking-wider uppercase">Live Core Action Gateways Infrastructure Links Table</div>
                    <div class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <a href="${data.applyLink || '#'}" target="_blank" class="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold p-3 rounded-xl shadow-lg transition-all"><i data-lucide="external-link" class="w-4 h-4"></i> Apply Online Direct Gateway</a>
                        <a href="${data.notificationLink || '#'}" target="_blank" class="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold p-3 rounded-xl shadow-lg transition-all"><i data-lucide="file-down" class="w-4 h-4"></i> Download Official Notification PDF</a>
                    </div>
                </div>
            </div>
        `;
    }

    // C. USER / CONTRIBUTOR DASHBOARD CREATION INTERFACES WITH PIPELINE TRACKING
    else if (currentActiveView === 'user_contributor_dashboard') {
        const querySnapshot = await getDocs(collection(db, "jobs"));
        let userSubmittedJobs = [];
        querySnapshot.forEach((doc) => { if(doc.data().authorName === mockUsers[currentRoleKey].name) userSubmittedJobs.push({ id: doc.id, ...doc.data() }); });

        let historyRows = userSubmittedJobs.map(j => {
            let badgeStyle = j.approvalStatus === 'Live' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200';
            return `<tr class="border-b border-white/10 text-xs font-semibold text-slate-700">
                <td class="p-3"><span class="px-2 py-0.5 bg-white rounded border">${j.type}</span></td>
                <td class="p-3 max-w-xs truncate">${j.title}</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded border ${badgeStyle} uppercase text-[9px] tracking-wider">${j.approvalStatus}</span></td>
            </tr>`;
        }).join('');

        container.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form class="lg:col-span-2 glass-panel p-5 rounded-2xl border space-y-4 shadow-lg" onsubmit="window.handleContributorPostSubmit(event)">
                    <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2"><i data-lucide="file-plus" class="text-indigo-600 w-4 h-4"></i> Create New Post Entry Node Structure</h3>
                    <div class="grid grid-cols-2 gap-3">
                        <div><label class="block text-[10px] font-bold text-slate-500 uppercase">Target Category</label><select id="postType" class="w-full text-xs glass-input p-2.5 rounded-xl"><option value="Job">Job</option><option value="Admit Card">Admit Card</option><option value="Result">Result</option><option value="Sarkari Yojna">Sarkari Yojna</option><option value="Scholarship">Scholarship</option></select></div>
                        <div><label class="block text-[10px] font-bold text-slate-500 uppercase">Authority Board</label><input type="text" id="postAuth" required placeholder="e.g. SSC, BPSC, UPSC" class="w-full text-xs glass-input p-2.5 rounded-xl"></div>
                    </div>
                    <div><label class="block text-[10px] font-bold text-slate-500 uppercase">Post Expansion Title Header</label><input type="text" id="postTitle" required placeholder="e.g. SBI PO Recruitment 2026 Online Framework" class="w-full text-xs glass-input p-2.5 rounded-xl"></div>
                    <div class="grid grid-cols-2 gap-3">
                        <div><label class="block text-[10px] font-bold text-slate-500 uppercase">Start Date</label><input type="text" id="postStart" placeholder="e.g. 25-06-2026" class="w-full text-xs glass-input p-2.5 rounded-xl"></div>
                        <div><label class="block text-[10px] font-bold text-slate-500 uppercase">Last Apply Date</label><input type="text" id="postLast" placeholder="e.g. 30-07-2026" class="w-full text-xs glass-input p-2.5 rounded-xl"></div>
                    </div>
                    <div><label class="block text-[10px] font-bold text-slate-500 uppercase">Fees Structure Guidelines</label><textarea id="postFees" rows="2" placeholder="General/OBC: ₹750, SC/ST: ₹0" class="w-full text-xs glass-input p-2.5 rounded-xl"></textarea></div>
                    <div><label class="block text-[10px] font-bold text-slate-500 uppercase">Eligibility Criteria Description</label><textarea id="postEligibility" rows="2" placeholder="Bachelor Degree in any stream from verified university..." class="w-full text-xs glass-input p-2.5 rounded-xl"></textarea></div>
                    <div class="grid grid-cols-2 gap-3">
                        <div><label class="block text-[10px] font-bold text-slate-500 uppercase">Online Application Gateway Link</label><input type="text" id="postApplyUrl" placeholder="https://example.com/apply" class="w-full text-xs glass-input p-2.5 rounded-xl"></div>
                        <div><label class="block text-[10px] font-bold text-slate-500 uppercase">Official Notification Link (PDF)</label><input type="text" id="postNotifyUrl" placeholder="https://example.com/notify.pdf" class="w-full text-xs glass-input p-2.5 rounded-xl"></div>
                    </div>
                    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3 rounded-xl shadow-lg transition-all">Submit Architecture for Administrative Review 🚀</button>
                </form>

                <div class="glass-panel p-4 rounded-2xl border space-y-4">
                    <h4 class="text-xs font-bold uppercase text-slate-700 flex items-center gap-1 border-b pb-2"><i data-lucide="history" class="w-4 h-4 text-indigo-600"></i> Your Submissions Pipeline</h4>
                    <div class="overflow-x-auto"><table class="w-full text-left"><tbody>${historyRows || '<tr><td class="text-xs text-slate-400 py-4">No submissions records tracked.</td></tr>'}</tbody></table></div>
                </div>
            </div>
        `;
    }

    // D. HIGH COMMAND SUPER EXECUTIVES MASTER SYSTEM CONTROL CONSOLE (ADMIN)
    else if (currentActiveView === 'admin_dashboard') {
        const querySnapshot = await getDocs(collection(db, "jobs"));
        let jobs = []; querySnapshot.forEach((doc) => { jobs.push({ id: doc.id, ...doc.data() }); });

        const catSnapshot = await getDocs(collection(db, "categories"));
        let categories = []; catSnapshot.forEach((doc) => { categories.push({ id: doc.id, ...doc.data() }); });

        let rowsHTML = jobs.map(j => {
            let isPending = j.approvalStatus === 'Pending for Approval';
            return `<tr class="border-b border-white/20 text-xs font-medium text-slate-700 hover:bg-white/10 transition-all">
                <td class="p-3"><span class="px-2 py-0.5 bg-white rounded border text-[10px] font-bold uppercase">${j.type}</span></td>
                <td class="p-3 font-semibold text-slate-800 max-w-xs truncate">${j.title}</td>
                <td class="p-3 text-slate-400 font-bold italic">${j.authorName || 'System Admin'}</td>
                <td class="p-3 text-right space-x-1.5 whitespace-nowrap">
                    ${isPending ? `<button onclick="window.approvePostingNode('${j.id}')" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-2 py-1 rounded-lg transition-all">✓ Approve Live</button>` : ''}
                    <button onclick="window.deletePostingNode('${j.id}')" class="text-rose-600 p-1"><i data-lucide="trash-2" class="w-4 h-4 inline-block"></i></button>
                </td>
            </tr>`;
        }).join('');

        let catChips = categories.map(c => `<div class="inline-flex items-center gap-1.5 bg-white/60 border px-3 py-1 rounded-xl text-xs font-bold text-slate-700 shadow-sm"><span>${c.name}</span><button onclick="window.deleteCategoryConfigNode('${c.id}')" class="text-rose-500">✕</button></div>`).join('');

        container.innerHTML = `
            <div class="space-y-6">
                <div class="glass-panel p-5 rounded-2xl border space-y-4 shadow-md">
                    <h4 class="text-xs font-bold uppercase text-slate-700 tracking-wider flex items-center gap-1.5"><i data-lucide="layout-grid" class="w-4 h-4 text-indigo-600"></i> Custom Categories Hub Framework Configuration</h4>
                    <div class="flex flex-wrap gap-2 pt-1">${catChips || '<span class="text-xs text-slate-400">No custom configuration categories found.</span>'}</div>
                    <form class="flex items-center gap-2" onsubmit="window.handleAdminCategorySubmit(event)">
                        <input type="text" id="newAdminCatInput" required placeholder="Add Custom Global Category Element Node (e.g. Answer Key)..." class="flex-1 text-xs glass-input p-2.5 rounded-xl">
                        <button type="submit" class="bg-indigo-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl">+ Inject Node</button>
                    </form>
                </div>

                <div class="glass-panel border rounded-2xl overflow-hidden shadow-xl">
                    <div class="p-4 bg-white/40 border-b flex items-center justify-between"><h4 class="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5"><i data-lucide="database" class="w-4 h-4 text-indigo-600"></i> Database Storage Core Ledger System Configurations Management</h4><button onclick="window.openJobCreateModal()" class="bg-slate-800 text-white text-[10px] px-3 py-1.5 rounded-lg font-bold">+ Write System Entry</button></div>
                    <div class="overflow-x-auto max-h-96"><table class="w-full text-left border-collapse">
                        <thead><tr class="bg-white/30 text-[10px] font-bold uppercase text-slate-500 border-b"><th class="p-3">Type</th><th class="p-3">Title Description</th><th class="p-3">Author Node</th><th class="p-3 text-right">Actions Operations</th></tr></thead>
                        <tbody>${rowsHTML || '<tr><td class="p-3 text-xs text-slate-400">No postings active inside cloud server storage nodes.</td></tr>'}</tbody>
                    </table></div>
                </div>
            </div>
        `;
    }

    // E. STATIC MANAGED INFORMATIONAL CONTEXT CHANNELS (ABOUT & CONTACT PAGES)
    else if (currentActiveView === 'about_page' || currentActiveView === 'contact_page') {
        let isAbout = currentActiveView === 'about_page';
        container.innerHTML = `
            <div class="glass-panel rounded-2xl p-6 border space-y-4 max-w-2xl mx-auto shadow-xl">
                <h3 class="text-base font-bold text-slate-800 uppercase tracking-wider border-b pb-2 flex items-center gap-2"><i data-lucide="${isAbout ? 'info' : 'mail'}" class="text-indigo-600 w-5 h-5"></i> ${isAbout ? 'About LuminaEdu Hub System' : 'Contact Administration Desk Gate'}</h3>
                <p class="text-xs text-slate-600 leading-relaxed font-medium">${isAbout ? 'LuminaEdu is a fully unified distributed educational system framework processing live nodes metadata arrays for student scholarly acceleration ecosystems. Operating under full multi-role access control environments execution logs.' : 'For security clearing operations, programmatic reporting or business infrastructure query alignment frameworks, reach out directly to target technical mail node pipelines: <strong>support@luminaedu.live</strong>'}</p>
                <button onclick="window.navigateView('public_jobs')" class="bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl">Back to Main Feed</button>
            </div>
        `;
    }
    updateIcons();
}

// ==========================================
// FORM SUBMISSIONS & FIREBASE DATA WRITERS
// ==========================================
window.handleContributorPostSubmit = async function(e) {
    e.preventDefault();
    const type = document.getElementById('postType').value;
    const authority = document.getElementById('postAuth').value.trim();
    const title = document.getElementById('postTitle').value.trim();
    const startDate = document.getElementById('postStart').value.trim();
    const lastDate = document.getElementById('postLast').value.trim();
    const feesDetails = document.getElementById('postFees').value.trim();
    const eligibility = document.getElementById('postEligibility').value.trim();
    const applyLink = document.getElementById('postApplyUrl').value.trim() || "#";
    const notificationLink = document.getElementById('postNotifyUrl').value.trim() || "#";

    await addDoc(collection(db, "jobs"), {
        type, authority, title, startDate, lastDate, feesDetails, eligibility, applyLink, notificationLink,
        approvalStatus: 'Pending for Approval',
        authorName: mockUsers[currentRoleKey].name,
        status: type === 'Job' ? 'Apply Now' : (type === 'Admit Card' ? 'Download' : 'View Result')
    });

    alert("🎉 Submission Successful! Post node locked inside verification queue buffer.");
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
    const docRef = doc(db, "jobs", id);
    await updateDoc(docRef, { approvalStatus: 'Live' });
    renderMainContent();
};

window.deletePostingNode = async function(id) {
    await deleteDoc(doc(db, "jobs", id));
    renderMainContent();
};

window.openJobCreateModal = async function() {
    const catSnapshot = await getDocs(collection(db, "categories"));
    let coreCategories = ['Job', 'Admit Card', 'Result', 'Sarkari Yojna', 'Scholarship'];
    catSnapshot.forEach((doc) => { if(!coreCategories.includes(doc.data().name)) coreCategories.push(doc.data().name); });
    let optionsHTML = coreCategories.map(c => `<option value="${c}">${c}</option>`).join('');

    document.getElementById('modalContainer').innerHTML = `
        <div class="p-5 border-b bg-white/20 flex items-center justify-between"><h3 class="font-bold text-sm text-slate-800 uppercase">Direct Injection Form Panel</h3><button onclick="window.toggleModalVisibility(false)" class="text-slate-400">✕</button></div>
        <form class="p-5 space-y-3" onsubmit="window.handleAdminDirectJobSubmit(event)">
            <select id="admType" class="w-full text-xs glass-input p-2.5 rounded-xl">${optionsHTML}</select>
            <input type="text" id="admAuth" required placeholder="Authority Board" class="w-full text-xs glass-input p-2.5 rounded-xl">
            <input type="text" id="admTitle" required placeholder="Listing Header Description" class="w-full text-xs glass-input p-2.5 rounded-xl">
            <div class="grid grid-cols-2 gap-2">
                <input type="text" id="admStart" placeholder="Start Date" class="text-xs glass-input p-2.5 rounded-xl">
                <input type="text" id="admLast" placeholder="Last Apply Date" class="text-xs glass-input p-2.5 rounded-xl">
            </div>
            <textarea id="admFees" rows="2" placeholder="Fees Structure Guidelines" class="w-full text-xs glass-input p-2.5 rounded-xl"></textarea>
            <textarea id="admElig" rows="2" placeholder="Eligibility Criteria Description" class="w-full text-xs glass-input p-2.5 rounded-xl"></textarea>
            <div class="grid grid-cols-2 gap-2">
                <input type="text" id="admApply" placeholder="Apply Online Link" class="text-xs glass-input p-2.5 rounded-xl">
                <input type="text" id="admNotify" placeholder="Notification Link" class="text-xs glass-input p-2.5 rounded-xl">
            </div>
            <button type="submit" class="w-full bg-indigo-600 text-white font-bold text-xs py-3 rounded-xl shadow-lg">Broadcast Globally Live 🚀</button>
        </form>
    `;
    window.toggleModalVisibility(true);
};

window.handleAdminDirectJobSubmit = async function(e) {
    e.preventDefault();
    const type = document.getElementById('admType').value;
    const authority = document.getElementById('admAuth').value.trim();
    const title = document.getElementById('admTitle').value.trim();
    const startDate = document.getElementById('admStart').value.trim();
    const lastDate = document.getElementById('admLast').value.trim();
    const feesDetails = document.getElementById('admFees').value.trim();
    const eligibility = document.getElementById('admElig').value.trim();
    const applyLink = document.getElementById('admApply').value.trim() || "#";
    const notificationLink = document.getElementById('admNotify').value.trim() || "#";
    let status = type === 'Job' ? 'Apply Now' : (type === 'Admit Card' ? 'Download' : 'View Result');

    await addDoc(collection(db, "jobs"), {
        type, authority, title, startDate, lastDate, feesDetails, eligibility, applyLink, notificationLink, status,
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

// BOOT ENGINE LOGS SEQUENCE ON DOM LOADED
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('roleSwitcher').addEventListener('change', (e) => window.switchRole(e.target.value));
    document.getElementById('sidebarToggleBtn').addEventListener('click', () => {
        document.getElementById('navLinks').classList.toggle('hidden');
        document.getElementById('userBadge').classList.toggle('hidden');
    });
    window.navigateView('public_jobs');
});
