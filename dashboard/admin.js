window.executeDashboardIdentityLoginPipeline = async function() {
    const enteredPassword = document.getElementById('dashPass').value.trim();
    if(!enteredPassword) return;

    // 🚀 DIRECT MEMORY BYPASS: Rules check karne se pehle hi instant login bypass layer
    if(enteredPassword === "LuminaAdmin@2026") {
        sessionStorage.setItem("lumina_token", "active");
        document.getElementById('dashboardAuthGatewayGate').classList.add('hidden');
        document.getElementById('adminMasterConsoleView').classList.remove('hidden');
        document.getElementById('dashboardLogoutBtn').classList.remove('hidden');
        window.spawnPremiumToastAlert("Unlocked", "🎉 एडमिन कंसोल सफलतापूर्वक लोड हो गया है!", "success");
        startDatabaseListenersEngine();
        return; // Execution yahan se return ho jayegi, rules crash nahi hoga!
    }

    try {
        const docSnap = await getDoc(doc(db, "admin_settings", "root_config"));
        if (docSnap.exists() && enteredPassword === docSnap.data().master_password) {
            sessionStorage.setItem("lumina_token", "active");
            document.getElementById('dashboardAuthGatewayGate').classList.add('hidden');
            document.getElementById('adminMasterConsoleView').classList.remove('hidden');
            document.getElementById('dashboardLogoutBtn').classList.remove('hidden');
            window.spawnPremiumToastAlert("Unlocked", "🎉 एडमिन कंसोल सफलतापूर्वक लोड हो गया है!", "success");
            startDatabaseListenersEngine();
        } else {
            window.spawnPremiumToastAlert("Failed", "❌ पासवर्ड गलत है, कृपया दोबारा जांचें।", "error");
        }
    } catch(err) {
        window.spawnPremiumToastAlert("Sync Fault", "कृपया ऊपर दिए गए स्टेप के अनुसार फायरबेस रूल्स पब्लिश करें!", "error");
    }
};
