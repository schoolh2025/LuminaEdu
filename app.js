import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "YOUR_REAL_FIREBASE_API_KEY_HERE",
    authDomain: "luminaedu-ai786.firebaseapp.com",
    projectId: "luminaedu-ai786",
    storageBucket: "luminaedu-ai786.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

window.fbDB = db;
let selectedCategoryFilter = 'All';
let cachedJobsArray = [];

window.registerNewUserNode = async function(email, password, fullname) {
    if(!email || !password || !fullname) return alert("सभी फ़ील्ड भरना अनिवार्य है।");
    try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", credential.user.uid), { name: fullname, role: "UserContributor", email: email });
        alert("🎉 पंजीकरण सफल! आपको कॉन्ट्रिब्यूटर राइटिंग स्टूडियो पर भेजा जा रहा है।");
        window.location.href = "dashboard/user.html";
    } catch(err) { alert("Registration Error: " + err.message); }
};

window.loginUserNode = async function(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("पहुंच सत्यापित! यूजर डैशबोर्ड लोड हो रहा है।");
        window.location.href = "dashboard/user.html";
    } catch(err) { alert("Access Denied: " + err.message); }
};

window.triggerForgotRecoveryNode = async function(email) {
    if(!email) return alert("कृपया अपना पंजीकृत ईमेल एड्रेस दर्ज करें।");
    try {
        await sendPasswordResetEmail(auth, email);
        alert("पासवर्ड रीमेपिंग लिंक आपके ईमेल पर सफलतापूर्वक भेज दिया गया है।");
    } catch(err) { alert(err.message); }
};

window.setJobFilter = function(categoryName) {
    selectedCategoryFilter = categoryName;
    executeUIRenderPipeline();
};

function executeUIRenderPipeline() {
    const feed = document.getElementById('publicCardsFeed');
    const sideTrend = document.getElementById('sidebarTrendingCluster');
    if(!feed) return;

    const filtered = cachedJobsArray.filter(j => {
        if(j.approvalStatus !== 'Live') return false;
        if(selectedCategoryFilter === 'All') return true;
        return j.type.toLowerCase() === selectedCategoryFilter.toLowerCase();
    });

    if(filtered.length === 0) {
        feed.innerHTML = `<div class="col-span-full text-center py-10 text-sm font-bold text-slate-500 bg-white/40 border p-4 rounded-2xl">"${selectedCategoryFilter}" श्रेणी में वर्तमान में कोई लाइव विज्ञापन सक्रिय नहीं है।</div>`;
        return;
    }

    // UPDATED CARDS RENDERER (Clean, highly readable and clear fonts size)
    feed.innerHTML = filtered.map(j => {
        let routeType = j.type.toLowerCase();
        let targetPage = 'pages/job.html';
        if(routeType === 'yojna') targetPage = 'pages/yojna.html';
        else if(routeType === 'admit-card') targetPage = 'pages/admit-card.html';
        else if(routeType === 'result') targetPage = 'pages/result.html';
        else if(routeType === 'scholarship') targetPage = 'pages/scholarship.html';
        
        let displayImg = (j.imageUrls && j.imageUrls.length > 0 && (j.imgDisplayLocation === 'both' || j.imgDisplayLocation === 'front')) 
            ? `<img src="${j.imageUrls[0]}" class="w-full h-44 object-cover rounded-xl mb-4 border border-slate-100 shadow-sm" alt="Banner">` : "";

        return `
            <div class="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/60 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                <div>
                    ${displayImg}
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-xs font-extrabold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 uppercase border border-indigo-100">${j.type}</span>
                        <span class="text-xs font-bold text-slate-500">📅 अंतिम तिथि: ${j.lastDate || 'सक्रिय'}</span>
                    </div>
                    <h3 class="font-extrabold text-slate-900 text-base md:text-lg leading-snug tracking-tight mb-2">${j.title}</h3>
                    <p class="text-sm text-slate-600 font-bold">🏛️ बोर्ड/संस्था: ${j.authority}</p>
                </div>
                <a href="${targetPage}?id=${j.id}" class="w-full bg-indigo-600 text-white text-sm font-bold text-center py-3 rounded-xl mt-4 block hover:bg-indigo-700 transition-all shadow-md tracking-wide">पूर्ण विवरण एवं लिंक देखें →</a>
            </div>
        `;
    }).join('');

    if(sideTrend) {
        const trends = cachedJobsArray.filter(j => j.approvalStatus === 'Live').slice(0, 5);
        sideTrend.innerHTML = trends.map(t => {
            let rt = t.type.toLowerCase();
            let p = 'pages/job.html';
            if(rt === 'yojna') p = 'pages/yojna.html';
            else if(rt === 'admit-card') p = 'pages/admit-card.html';
            else if(rt === 'result') p = 'pages/result.html';
            else if(rt === 'scholarship') p = 'pages/scholarship.html';
            return `<a href="${p}?id=${t.id}" class="block hover:text-indigo-800 tracking-tight py-1.5 border-b border-dashed border-slate-200 font-bold text-slate-700">👉 ${t.title}</a>`;
        }).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('publicCardsFeed')) {
        const filterBox = document.getElementById('categoryFilterContainer');
        const coreCategories = ['All', 'Job', 'Admit-Card', 'Result', 'Yojna', 'Scholarship'];
        if(filterBox) {
            filterBox.innerHTML = coreCategories.map(cat => `
                <button onclick="window.setJobFilter('${cat}')" class="px-4 py-2 text-sm font-bold rounded-xl border bg-white/60 border-white text-slate-700 hover:bg-slate-800 hover:text-white transition-all shadow-sm focus:bg-slate-800 focus:text-white">
                    ${cat}
                </button>
            `).join('');
        }

        onSnapshot(collection(db, "jobs"), (snapshot) => {
            cachedJobsArray = [];
            snapshot.forEach(docSnap => { cachedJobsArray.push({ id: docSnap.id, ...docSnap.data() }); });
            executeUIRenderPipeline();
        });
    }
});
