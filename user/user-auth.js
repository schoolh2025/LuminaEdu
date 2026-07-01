window.togglePostInputWorkspaceMode = function(mode) {
    const visualBox = document.getElementById('workspaceVisualBlockContainer');
    const visualEditor = document.getElementById('visualEditorContainerBox');
    const htmlArea = document.getElementById('aDesc');
    
    document.getElementById('modeVisualBtn').className = mode === 'visual' ? 'tab-active px-3 py-1 text-xs font-bold rounded-lg' : 'px-3 py-1 text-xs font-bold rounded-lg';
    document.getElementById('modeHtmlBtn').className = mode === 'html' ? 'tab-active px-3 py-1 text-xs font-bold rounded-lg' : 'px-3 py-1 text-xs font-bold rounded-lg';
    
    if(mode === 'html') {
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

window.executeAdminGatewayUnlockEngine = async function() {
    const entered = document.getElementById('adminSecretKey').value.trim();
    if(!entered) return;

    if(entered === "LuminaAdmin@2026") {
        sessionStorage.setItem("admin_token", "active_root");
        document.getElementById('adminAuthCover').classList.add('hidden');
        
        const consoleView = document.getElementById('adminConsoleWorkspace');
        consoleView.style.setProperty('display', 'block', 'important');
        
        document.getElementById('adminLogoutBtn').classList.remove('hidden');
        window.spawnPremiumToastAlert("Unlocked", "Super admin workspace unlocked.", "success");
        startDatabaseListenersEngine();
    } else {
        alert("❌ Invalid admin access token!");
    }
};

// Auto check token on load
if(sessionStorage.getItem("admin_token") === "active_root") {
    setTimeout(() => {
        document.getElementById('adminAuthCover')?.classList.add('hidden');
        const view = document.getElementById('adminConsoleWorkspace');
        if(view) view.style.setProperty('display', 'block', 'important');
        document.getElementById('adminLogoutBtn')?.classList.remove('hidden');
        startDatabaseListenersEngine();
    }, 100);
}
