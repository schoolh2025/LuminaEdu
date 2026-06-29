import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 🚨 APNI REAL CONSOLE CONFIG DETAILS PARAMETERS STRINGS BIILKUL SAHI FILL KAREIN:
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

let selectedCategoryFilter = 'All';
let cachedJobsArray = [];
let activeDynamicCategoriesList = [];
let layoutGridColumnsSetting = 'lg:grid-cols-3'; 
let globalImageVisibilitySetting = 'show'; 

// AUTH NODES BINDING
window.registerNewUserNode = async function(email, password, fullname) {
    if(!email || !password || !fullname) return window.spawnPremiumToastAlert("Validation Error", "सभी फ़ील्ड्स भरना अनिवार्य है।", "error");
    try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", credential.user.uid), { name: fullname, role: "UserContributor", email: email });
        window.spawnPremiumToastAlert("Success", "🎉 पंजीकरण सफल! वर्कस्पेस चालू हो रहा है।", "success");
        window.toggleAuthOverlay(false);
        window.navigateToHub('contributor');
    } catch(err) { window.spawnPremiumToastAlert("Error", err.message, "error"); }
};

window.loginUserNode = async function(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.spawnPremiumToastAlert("Success", "🎉 लॉगिन सफल!", "success");
        window.toggleAuthOverlay(false);
        window.navigateToHub('contributor');
    } catch(err) { window.spawnPremiumToastAlert("Error", err.message, "error"); }
};

window.executeForgotDispatchRecoveryLink = async function() {
    const email = document.getElementById('forgotUsrEmail').value.trim();
    if(!email) return window.spawnPremiumToastAlert("Input Missing", "कृपया ईमेल दर्ज करें।", "error");
    try {
        await sendPasswordResetEmail(auth, email);
        window.spawnPremiumToastAlert("Email Dispatched", "🔑 पासवर्ड रीсет लिंक भेज दिया गया है।", "success");
        window.toggleAuthOverlay(false);
    } catch(err) { window.spawnPremiumToastAlert("Error", err.message, "error"); }
};

// CATEGORY CHIPS VISUAL BUILDER
window.setJobFilter = function(categoryName) {
    selectedCategoryFilter = categoryName;
    renderDynamicChipsLayout();
    window.executeLiveSearchFiltering();
};

function renderDynamicChipsLayout() {
    const box = document.getElementById('categoryFilterContainer');
    if(!box) return;

    box.innerHTML = activeDynamicCategoriesList.map(b => {
        let isActive = selectedCategoryFilter.toLowerCase() === b.name.toLowerCase();
        let currentCustomStyle = isActive 
            ? `background-color: ${b.hexColor || '#4f46e5'}; color: white; border-color: ${b.hexColor || '#4f46e5'}; font-weight: 800; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);`
            : `background-color: rgba(255,255,255,0.9); color: #1e293b; border-color: rgba(226,232,240,0.8); font-weight: 700;`;

        return `<button onclick="window.setJobFilter('${b.name}')" style="${currentCustomStyle}" class="px-4 py-2 text-xs rounded-xl border transition-all duration-150 tracking-wide">${b.name}</button>`;
    }).join('');
}

// UNIFIED PIPELINE FOR SEARCH AND SORTING
window.executeLiveSearchFiltering = function() {
    const searchVal = document.getElementById('globalPortalSearchBox')?.value.trim().toLowerCase() || "";
    const sortVal = document.getElementById('globalPortalSortSelector')?.value || "newest";
    const feed = document.getElementById('publicCardsFeed');
    
    if(!feed) return;

    let dataset = cachedJobsArray.filter(j => {
        if(j.approvalStatus !== 'Live') return false;
        if(selectedCategoryFilter === 'All') return true;
        return j.type.toLowerCase() === selectedCategoryFilter.toLowerCase();
    });

    if(searchVal) {
        dataset = dataset.filter(j => 
            j.title.toLowerCase().includes(searchVal) || 
            j.authority.toLowerCase().includes(searchVal)
        );
    }

    if(sortVal === 'alpha') {
        dataset.sort((a, b) => a.title.localeCompare(b.title));
    } else if(sortVal === 'oldest') {
        dataset.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    } else {
        dataset.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }

    if(dataset.length === 0) {
        feed.innerHTML = `<div class="col-span-full text-center py-12 text-xs font-bold text-slate-400 bg-white/40 border border-dashed p-6 rounded-2xl">इस श्रेणी में कोई सक्रिय पोस्ट नहीं है।</div>`;
        return;
    }

    feed.innerHTML = dataset.map(j => {
        let displayImg = "";
        if(globalImageVisibilitySetting === 'show' && j.imageUrls && j.imageUrls.length > 0) {
            displayImg = `<img src="${j.imageUrls[0]}" class="w-full h-44 object-cover rounded-xl mb-3 border border-slate-100" alt="Card Banner">`;
        }

        const catObj = activeDynamicCategoriesList.find(c => c.name.toLowerCase() === j.type.toLowerCase());
        let badgeColorHex = catObj ? catObj.hexColor : '#6366f1';

        return `
            <div class="luxury-card p-5 flex flex-col justify-between">
                <div>
                    ${displayImg}
                    <div class="flex justify-between items-center mb-2.5">
                        <span style="background-color: ${badgeColorHex}12; color: ${badgeColorHex}; border-color: ${badgeColorHex}25;" class="text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase border tracking-wide">${j.type}</span>
                        <span class="text-[11px] font-bold text-slate-400">⏰ ${j.lastDate || 'Active'}</span>
                    </div>
                    <h3 class="font-extrabold text-slate-800 text-sm lg:text-base mb-1.5 leading-snug tracking-tight">${j.title}</h3>
                    <p class="text-xs text-slate-400 font-bold">🏛️ Board: ${j.authority}</p>
                </div>
                <button onclick="window.navigateToHub('detail', '${j.id}')" class="w-full bg-slate-50 hover:bg-indigo-50 border border-slate-100 text-indigo-600 font-extrabold text-xs text-center py-2.5 rounded-xl mt-4 transition-all shadow-sm">
                    View Details ↗
                </button>
            </div>
        `;
    }).join('');
}

// RIGHT SIDEBAR RECOMENDED STACK BUILDER
function renderRightSidebarRecommendedStack() {
    const sidebar = document.getElementById('rightSidebarRecommendedStack');
    if(!sidebar) return;

    const liveItems = cachedJobsArray.filter(j => j.approvalStatus === 'Live').slice(0, 5);
    sidebar.innerHTML = liveItems.map(j => `
        <div onclick="window.navigateToHub('detail', '${j.id}')" class="bg-white/50 hover:bg-white/90 p-3 rounded-xl border border-white/60 cursor-pointer transition-all text-xs flex flex-col gap-0.5">
            <h4 class="font-bold text-slate-800 truncate">${j.title}</h4>
            <span class="text-[9px] font-bold text-slate-400 uppercase">${j.authority}</span>
        </div>
    `).join('');
}

window.renderPostDeepContentView = function(postId) {
    const targetPayloadBox = document.getElementById('detailViewContentPayload');
    const matchedPost = cachedJobsArray.find(item => item.id === postId);
    if(!matchedPost || !targetPayloadBox) return;

    targetPayloadBox.innerHTML = `
        <div class="space-y-4 text-slate-800">
            <h2 class="text-xl lg:text-3xl font-black text-slate-900 leading-tight">${matchedPost.title}</h2>
            <p class="text-sm font-extrabold text-indigo-600">🏛️ Board: ${matchedPost.authority}</p>
            <div class="bg-white/80 border p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap">${matchedPost.description || 'विवरण उपलब्ध नहीं है।'}</div>
        </div>
    `;
};

window.executeContributorPostSubmission = async function(e) {
    e.preventDefault();
    try {
        await addDoc(collection(db, "jobs"), {
            title: document.getElementById('cPostTitle').value.trim(),
            authority: document.getElementById('cPostAuth').value.trim(),
            type: document.getElementById('cPostType').value,
            lastDate: document.getElementById('cPostDate').value.trim(),
            approvalStatus: "Pending for Approval",
            timestamp: Date.now()
        });
        window.spawnPremiumToastAlert("Proposal Sent", "🎉 सुपर एडमिन समीक्षा हेतु कतार में भेज दिया गया है!", "success");
        e.target.reset();
    } catch(err) { window.spawnPremiumToastAlert("Error", err.message, "error"); }
};

function startApplicationCoreEngine() {
    onSnapshot(collection(db, "categories"), (snapshot) => {
        activeDynamicCategoriesList = [{ id: 'all', name: 'All', hexColor: '#4f46e5' }];
        snapshot.forEach(docSnap => {
            activeDynamicCategoriesList.push({ id: docSnap.id, name: docSnap.data().name, hexColor: docSnap.data().hexColor || '#1e293b' });
        });
        renderDynamicChipsLayout();
        const cSelect = document.getElementById('cPostType');
        if(cSelect) {
            cSelect.innerHTML = activeDynamicCategoriesList.filter(c => c.name !== 'All').map(c => `<option value="${c.name}">${c.name}</option>`).join('');
        }
    });

    onSnapshot(doc(db, "app_settings", "grid_layout"), (docSnap) => {
        if(docSnap.exists()) {
            const d = docSnap.data();
            layoutGridColumnsSetting = d.columnsClass || 'lg:grid-cols-3';
            globalImageVisibilitySetting = d.imageVisibility || 'show';
        }
        window.executeLiveSearchFiltering();
    });

    onSnapshot(collection(db, "jobs"), (snapshot) => {
        cachedJobsArray = [];
        snapshot.forEach(docSnap => { cachedJobsArray.push({ id: docSnap.id, ...docSnap.data() }); });
        window.executeLiveSearchFiltering();
        renderRightSidebarRecommendedStack();
    });
}

window.addEventListener('load', startApplicationCoreEngine);
window.executeLiveSearchFiltering = window.executeLiveSearchFiltering;
