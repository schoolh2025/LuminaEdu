// 🔥 IS UPDATED RENDER BLOCK LOGIC SE APP.JS KE LOOP CODES KO RE-ALIGN KAREIN:
feed.innerHTML = filtered.map(j => {
    let routeType = j.type.toLowerCase();
    let targetPage = 'pages/job.html';
    if(routeType === 'yojna') targetPage = 'pages/yojna.html';
    else if(routeType === 'admit-card') targetPage = 'pages/admit-card.html';
    else if(routeType === 'result') targetPage = 'pages/result.html';
    else if(routeType === 'scholarship') targetPage = 'pages/scholarship.html';
    
    // Dynamic Grid tracking evaluation logic: Selects if standard or 2-column featured horizontal layout item
    let gridSpanProperty = (j.cardSizeLayout === 'featured') ? 'md:col-span-2 lg:col-span-2 bg-gradient-to-r from-white to-slate-50' : 'col-span-1 bg-white';
    
    let displayImg = (j.imageUrls && j.imageUrls.length > 0 && (j.imgDisplayLocation === 'both' || j.imgDisplayLocation === 'front')) 
        ? `<img src="${j.imageUrls[0]}" class="w-full h-48 object-cover rounded-xl mb-4 border border-slate-100 shadow-sm" alt="Banner">` : "";

    return `
        <div class="premium-card flex flex-col justify-between ${gridSpanProperty}">
            <div>
                ${displayImg}
                <div class="flex justify-between items-center mb-3">
                    <span class="text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                        j.type === 'Job' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        j.type === 'Yojna' ? 'bg-green-50 text-green-700 border border-green-200' :
                        j.type === 'Result' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        j.type === 'Admit-Card' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                        'bg-purple-50 text-purple-700 border border-purple-200'
                    }">${j.type}</span>
                    <span class="text-xs font-bold text-slate-500">📅 अंतिम तिथि: ${j.lastDate || 'सक्रिय'}</span>
                </div>
                <h3 class="font-extrabold text-slate-900 text-base md:text-lg leading-snug tracking-tight mb-2">${j.title}</h3>
                <p class="text-sm text-slate-600 font-bold">🏛️ बोर्ड/संस्था: ${j.authority}</p>
            </div>
            <a href="${targetPage}?id=${j.id}" class="w-full bg-indigo-600 text-white text-sm font-bold text-center py-3 rounded-xl mt-4 block hover:bg-indigo-700 transition-all shadow-md tracking-wide">पूर्ण विवरण एवं लिंक देखें →</a>
        </div>
    `;
}).join('');
