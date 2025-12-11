// js/langJ.js

let currentLang = 'ja';

const langDataJ = {
    ja: {
        headerTitle: "防災モード",
        alertMsg: "現在、防災モードが有効です。避難情報と災害警報にご注意ください。",
        switchMode: "通常モードに切替",
        infoTitle: "重要情報・避難ガイド",
        
        // --- 災害ごとの案内テキスト ---
        shelter: `
            <p><strong>避難所・病院を地図上に表示しています。</strong></p>
            <p>災害の種類ボタンを押すと、それぞれの避難行動ガイドが表示されます。</p>
            <hr>
            <p><strong>観光客の方へ:</strong></p>
            <ul>
                <li><strong>ホテル滞在中:</strong> 頑丈な大型ホテルはそのまま避難場所（Shelter in Place）になることが多いです。スタッフの指示に従ってください。</li>
                <li><strong>外出中:</strong> サイレンが鳴ったら、スマホの緊急速報を確認し、近くの頑丈な建物へ避難してください。</li>
            </ul>
        `,
        infoTsunami: `
            <p><strong style="color:red;">津波 (Tsunami) 警報時</strong></p>
            <p>指定避難所へ行くことよりも<strong>「高い場所・内陸」へ逃げることが最優先</strong>です。</p>
            <ul>
                <li><strong>行動:</strong> 赤色の「浸水想定区域」の外へ出てください。「Mauka（山側）」へ向かいます。</li>
                <li><strong>垂直避難:</strong> 時間がない場合、鉄筋コンクリート製の頑丈な建物の4階以上へ上がってください。</li>
                <li><strong>注意:</strong> 車は渋滞するため、原則「徒歩」で高台を目指してください。</li>
            </ul>
        `,
        infoVolcano: `
            <p><strong>火山 (Volcano) / 溶岩流</strong></p>
            <p>ハワイ島（ビッグアイランド）の火山活動に関する情報です。</p>
            <ul>
                <li><strong>行動:</strong> 公式な避難指示に従ってください。</li>
                <li><strong>Vog (火山ガス):</strong> 煙がひどい場合は窓を閉めて屋内に待機してください。</li>
            </ul>
        `,
        infoHurricane: `
            <p><strong>ハリケーン (Hurricane)</strong></p>
            <p>強風や暴風雨の際は、建物の強度が重要です。</p>
            <ul>
                <li><strong>避難場所:</strong> 公立高校などがシェルターになりますが、食料・水の提供がない場合が多いです。</li>
                <li><strong>ホテル待機:</strong> 頑丈なホテルにいる場合は、無理に外に出ず、窓から離れた部屋で待機してください。</li>
            </ul>
        `,

        returnToCurrentLocation: "現在地に戻る",
        legendTitle: "マップアイコン凡例",
        legendHospital: '<img src="img/byoin.png" style="width:25px;height:25px;margin-right:8px;vertical-align:middle;"> 病院・医療機関',
        legendOtherShelter: '<img src="img/hinan.png" style="width:25px;height:25px;margin-right:8px;vertical-align:middle;"> 避難所 (学校・公共施設等)',
        hazardMapTitle: "ハザードマップ凡例",
        hazardLegendText: "津波浸水想定区域（危険エリア）",
        currentFilterLabel: "現在表示中:",
        
        directionsTitle: "経路案内",
        startLabel: "出発地:",
        endLabel: "目的地:",
        travelModeLabel: "移動手段:",
        modeDriving: "車",
        modeWalking: "徒歩",
        modeBicycling: "自転車",
        modeTransit: "電車・公共交通機関",
        getDirectionsButton: "経路を検索",
        clearDirectionsButton: "経路をクリア",
        currentLocationButton: "現在地",
        googleMapsNaviButton: "🗺️ Googleマップでナビ開始",
        
        disasterFilterTitle: "災害タイプで絞り込む",
        filterTsunamiShelters: "津波避難所\n(ハザードマップ表示)",
        filterVolcanoShelters: "火山避難所\n(全島表示)",
        filterHurricaneShelters: "ハリケーン\n避難所",
        filterAllDisasters: "全て表示",
        filterHideAllDisasters: "非表示",
        
        linkTitleAll: "ハワイ州 緊急事態管理庁 (HI-EMA)",
        linkTitleTsunami: "NOAA 太平洋津波警報センター",
        linkTitleVolcano: "USGS ハワイ火山観測所",
        linkTitleHurricane: "NOAA 中部太平洋ハリケーンセンター"
    },
    en: {
        headerTitle: "Disaster Prevention Mode",
        alertMsg: "Disaster prevention mode is currently active. Please pay attention to evacuation information.",
        switchMode: "Switch to Normal Mode",
        infoTitle: "Evacuation Guide",
        shelter: `
            <p><strong>Shelters and Hospitals are shown on the map.</strong></p>
            <hr>
            <p><strong>Advice for Tourists:</strong></p>
            <ul>
                <li><strong>At Hotels:</strong> Major hotels often serve as "Shelter in Place" locations. Follow staff instructions.</li>
                <li><strong>Outdoors:</strong> If sirens sound, check alerts and move to a sturdy building immediately.</li>
            </ul>
        `,
        infoTsunami: `
            <p><strong style="color:red;">Tsunami Warning</strong></p>
            <p>Priority is to get to <strong>High Ground / Inland</strong>.</p>
            <ul>
                <li><strong>Action:</strong> Evacuate OUT of the Red Zone. Go "Mauka" (towards mountains).</li>
                <li><strong>Vertical Evacuation:</strong> Go to the 4th floor or higher of a concrete building.</li>
            </ul>
        `,
        infoVolcano: `
            <p><strong>Volcano</strong></p>
            <p>Information for Hawaii Island.</p>
            <ul>
                <li><strong>Action:</strong> Follow official orders. Stay indoors if Vog (volcanic smog) is heavy.</li>
            </ul>
        `,
        infoHurricane: `
            <p><strong>Hurricane</strong></p>
            <ul>
                <li><strong>Shelters:</strong> Schools/gyms are designated shelters. Bring your own food/water.</li>
                <li><strong>Hotels:</strong> Stay indoors away from windows.</li>
            </ul>
        `,

        returnToCurrentLocation: "Return to Current Location",
        legendTitle: "Map Icon Legend",
        legendHospital: '<img src="img/byoin.png" style="width:25px;height:25px;margin-right:8px;vertical-align:middle;"> Hospital / Medical',
        legendOtherShelter: '<img src="img/hinan.png" style="width:25px;height:25px;margin-right:8px;vertical-align:middle;"> Shelter (School/Center)',
        hazardMapTitle: "Hazard Map Legend",
        hazardLegendText: "Tsunami Inundation Zone (Danger Area)",
        currentFilterLabel: "Current View:",

        directionsTitle: "Directions",
        startLabel: "Origin:",
        endLabel: "Destination:",
        travelModeLabel: "Travel Mode:",
        modeDriving: "Driving",
        modeWalking: "Walking",
        modeBicycling: "Bicycling",
        modeTransit: "Transit",
        getDirectionsButton: "Get Directions",
        clearDirectionsButton: "Clear Directions",
        currentLocationButton: "Current Location",
        googleMapsNaviButton: "🗺️ Start Navigation in Google Maps",
        
        disasterFilterTitle: "Filter by Disaster Type",
        filterTsunamiShelters: "Tsunami Shelters\n(with Hazard Map)",
        filterVolcanoShelters: "Volcano Shelters\n(All Islands)",
        filterHurricaneShelters: "Hurricane\nShelters",
        filterAllDisasters: "Show All",
        filterHideAllDisasters: "Hide All",

        linkTitleAll: "Hawaii Emergency Management Agency (HI-EMA)",
        linkTitleTsunami: "NOAA Pacific Tsunami Warning Center",
        linkTitleVolcano: "USGS Hawaiian Volcano Observatory",
        linkTitleHurricane: "NOAA Central Pacific Hurricane Center"
    }
};

const officialLinks = {
    all: "https://dod.hawaii.gov/hiema/",
    tsunami: "https://www.tsunami.gov/",
    volcano: "https://www.usgs.gov/observatories/hvo",
    hurricane: "https://www.nhc.noaa.gov/?cpac"
};

function setLangJ(lang) {
    currentLang = lang;
    updateContentJ();
    // 言語切り替え時にもステータス表示を更新
    if (typeof updateFilterStatusText === 'function') {
        updateFilterStatusText();
    }
}

function updateContentJ() {
    const d = langDataJ[currentLang];
    
    document.getElementById("title").textContent = d.headerTitle;
    document.getElementById('headerTitle').textContent = d.headerTitle;
    document.getElementById('alertMsg').textContent = d.alertMsg;
    document.getElementById('switchMode').textContent = d.switchMode;
    document.getElementById('infoTitle').textContent = d.infoTitle;
    
    // 現在のフィルタ状態に基づいて情報を更新
    if (typeof updateInfoText === 'function') updateInfoText();

    document.getElementById('legendTitle').textContent = d.legendTitle;
    document.getElementById('legendHospital').innerHTML = d.legendHospital;
    document.getElementById('legendOtherShelter').innerHTML = d.legendOtherShelter;
    
    document.getElementById('hazardMapTitle').textContent = d.hazardMapTitle;
    document.getElementById('hazardLegendText').textContent = d.hazardLegendText;
    document.getElementById('currentFilterLabel').textContent = d.currentFilterLabel;

    document.getElementById('disasterFilterTitle').textContent = d.disasterFilterTitle;
    document.getElementById('filterTsunamiShelters').textContent = d.filterTsunamiShelters;
    document.getElementById('filterVolcanoShelters').textContent = d.filterVolcanoShelters;
    document.getElementById('filterHurricaneShelters').textContent = d.filterHurricaneShelters;
    document.getElementById('filterAllDisasters').textContent = d.filterAllDisasters;
    document.getElementById('filterHideAllDisasters').textContent = d.filterHideAllDisasters;

    document.getElementById('directionsTitle').textContent = d.directionsTitle;
    document.getElementById('startLabel').textContent = d.startLabel;
    document.getElementById('endLabel').textContent = d.endLabel;
    document.getElementById('travelModeLabel').textContent = d.travelModeLabel;
    document.getElementById('getDirectionsButton').textContent = d.getDirectionsButton;
    document.getElementById('clearDirectionsButton').textContent = d.clearDirectionsButton;
    
    const returnButton = document.getElementById("returnToCurrentLocationDisaster");
    if (returnButton) returnButton.textContent = d.returnToCurrentLocation;
    
    const naviButton = document.getElementById('googleMapsNaviButtonDisaster');
    if(naviButton) naviButton.textContent = d.googleMapsNaviButton;
    
    const startLocBtn = document.getElementById('currentLocationStartButtonDisaster');
    if(startLocBtn) startLocBtn.textContent = d.currentLocationButton;
    const endLocBtn = document.getElementById('currentLocationEndButtonDisaster');
    if(endLocBtn) endLocBtn.textContent = d.currentLocationButton;
}

// ★ 追加: フィルタ状態のテキスト（「現在表示中: XX」）を更新する関数
function updateFilterStatusText() {
    // map_disasterJ.js で定義されている currentDisasterFilter を参照
    const filter = (typeof currentDisasterFilter !== 'undefined') ? currentDisasterFilter : 'all';
    const d = langDataJ[currentLang];
    const statusEl = document.getElementById('currentFilterName');
    
    if (!statusEl) return;

    let text = "";
    switch(filter) {
        case 'tsunami': text = d.filterTsunamiShelters; break;
        case 'volcano': text = d.filterVolcanoShelters; break;
        case 'hurricane': text = d.filterHurricaneShelters; break;
        case 'all': text = d.filterAllDisasters; break;
        case 'hideAll': text = d.filterHideAllDisasters; break;
        default: text = d.filterAllDisasters;
    }
    // 改行コードをスペースに置換して表示
    statusEl.textContent = text.replace(/\n/g, " ");
    
    // リンクと詳細情報も更新
    updateOfficialLink(filter);
    updateInfoText();
}

// ★ 追加: 公式リンクを更新する関数
function updateOfficialLink(filter) {
    const linkItem = document.getElementById('officialLinkItem');
    if (!linkItem) return;
    
    const d = langDataJ[currentLang];
    let url = "";
    let title = "";

    switch(filter) {
        case 'tsunami': 
            url = officialLinks.tsunami; title = d.linkTitleTsunami; break;
        case 'volcano': 
            url = officialLinks.volcano; title = d.linkTitleVolcano; break;
        case 'hurricane': 
            url = officialLinks.hurricane; title = d.linkTitleHurricane; break;
        default: 
            url = officialLinks.all; title = d.linkTitleAll; break;
    }

    if (filter === 'hideAll') {
        linkItem.innerHTML = "";
    } else {
        linkItem.innerHTML = `<a href="${url}" target="_blank" style="color:#007bff; text-decoration:none; font-weight:bold; display:block; padding:5px; background:#f0f8ff; border-radius:4px;">🔗 ${title}</a>`;
    }
}

// ★ 追加: 重要情報を更新する関数
function updateInfoText() {
    const filter = (typeof currentDisasterFilter !== 'undefined') ? currentDisasterFilter : 'all';
    const d = langDataJ[currentLang];
    const shelterEl = document.getElementById('shelter');
    if (!shelterEl) return;

    switch(filter) {
        case 'tsunami': shelterEl.innerHTML = d.infoTsunami; break;
        case 'volcano': shelterEl.innerHTML = d.infoVolcano; break;
        case 'hurricane': shelterEl.innerHTML = d.infoHurricane; break;
        case 'hideAll': shelterEl.innerHTML = ""; break;
        default: shelterEl.innerHTML = d.shelter; break;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateContentJ();
});
