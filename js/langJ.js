// js/langJ.js

let currentLang = 'ja';

const langDataJ = {
    ja: {
        headerTitle: "防災モード",
        alertMsg: "現在、防災モードが有効です。避難情報と災害警報にご注意ください。",
        switchMode: "通常モードに切替",
        infoTitle: "重要情報・避難ガイド",
        // デフォルト（全て表示時）のメッセージ
        shelter: `
            <p><strong>避難所を地図上に表示しています。最寄りの避難場所を確認してください。</strong></p>
            <hr>
            <p><strong>観光客の方へのアドバイス:</strong></p>
            <ul>
                <li><strong>ホテルにいる場合:</strong> 基本的にスタッフの指示に従ってください。ハワイの主要な大型ホテルは頑丈で、そのまま避難場所として機能することが多いです（Shelter in Place）。</li>
                <li><strong>外出中の場合:</strong> サイレンが鳴ったら、現地のラジオ（FMなど）やスマホの緊急速報を確認してください。</li>
            </ul>
            <p><strong>覚えておくべき用語:</strong></p>
            <ul>
                <li><strong>Mauka (マウカ):</strong> 山側（海から離れる方向）</li>
                <li><strong>Makai (マカイ):</strong> 海側</li>
                <li><strong>Shelter in Place:</strong> 外に出ず、今いる建物の中で安全を確保すること</li>
                <li><strong>All Clear:</strong> 解除（安全宣言）</li>
            </ul>
        `,
        // 各災害ごとの詳細情報
        infoTsunami: `
            <p><strong style="color:red;">津波 (Tsunami) 警報時</strong></p>
            <p>指定避難所へ行くことよりも<strong>「高い場所・内陸」へ逃げることが最優先</strong>です。</p>
            <ul>
                <li><strong>避難場所:</strong> Tsunami Evacuation Zone（赤色エリア）の外へ出る。「Mauka（山側）」へ向かう。</li>
                <li><strong>垂直避難:</strong> 逃げる時間がない場合、鉄筋コンクリート製の頑丈な建物の4階以上へ上がってください。</li>
                <li><strong>注意:</strong> 車での避難は渋滞に巻き込まれるため、可能な限り<strong>徒歩で高台を</strong>目指してください。</li>
            </ul>
        `,
        infoVolcano: `
            <p><strong>火山 (Volcano) / 溶岩流</strong></p>
            <p>ハワイ島（ビッグアイランド）の火山活動に関する情報です。</p>
            <ul>
                <li><strong>行動:</strong> 公式な避難指示に従ってください。溶岩流の進行方向から離れ、煙（Vog）がひどい場合は窓を閉めて屋内に待機してください。</li>
                <li><strong>情報源:</strong> Hawaii County Civil Defense (ハワイ郡民間防衛局) の情報を確認してください。</li>
            </ul>
        `,
        infoHurricane: `
            <p><strong>ハリケーン (Hurricane)</strong></p>
            <p>強風や暴風雨の際は、建物の強度が重要です。</p>
            <ul>
                <li><strong>避難場所:</strong> 公立高校やコミュニティセンターが「Hurricane Shelters」として指定されますが、食料・水の提供がない場合が多いです（持参必須）。</li>
                <li><strong>ホテル待機:</strong> 頑丈なホテルにいる場合は、無理に外に出ず、窓から離れた部屋で待機するよう指示されることが一般的です。</li>
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
        filterVolcanoShelters: "火山避難所\n(ハワイ島のみ)",
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
        alertMsg: "Disaster prevention mode is currently active. Please pay attention to evacuation information and disaster warnings.",
        switchMode: "Switch to Normal Mode",
        infoTitle: "Important Info & Evacuation Guide",
        shelter: `
            <p><strong>Shelters are shown on the map. Please check your nearest evacuation point.</strong></p>
            <hr>
            <p><strong>Advice for Tourists:</strong></p>
            <ul>
                <li><strong>At Hotels:</strong> Follow staff instructions. Major hotels are often sturdy and serve as "Shelter in Place" locations.</li>
                <li><strong>Outdoors:</strong> If sirens sound, check local radio or phone alerts immediately.</li>
            </ul>
            <p><strong>Key Terms:</strong></p>
            <ul>
                <li><strong>Mauka:</strong> Mountainside (Away from sea)</li>
                <li><strong>Makai:</strong> Oceanside</li>
                <li><strong>Shelter in Place:</strong> Stay inside your current building</li>
                <li><strong>All Clear:</strong> Danger has passed</li>
            </ul>
        `,
        infoTsunami: `
            <p><strong style="color:red;">Tsunami Warning</strong></p>
            <p>Priority is to get to <strong>High Ground / Inland</strong> rather than a specific shelter.</p>
            <ul>
                <li><strong>Action:</strong> Evacuate OUT of the Tsunami Evacuation Zone (Red Zone). Go "Mauka" (towards mountains).</li>
                <li><strong>Vertical Evacuation:</strong> If trapped, go to the 4th floor or higher of a sturdy concrete building.</li>
                <li><strong>Note:</strong> Avoid driving if possible to prevent traffic jams. Walk to high ground.</li>
            </ul>
        `,
        infoVolcano: `
            <p><strong>Volcano / Lava</strong></p>
            <p>Information for Hawaii Island (Big Island).</p>
            <ul>
                <li><strong>Action:</strong> Follow official evacuation orders. Stay away from lava flow directions. If vog (volcanic smog) is heavy, stay indoors and close windows.</li>
                <li><strong>Source:</strong> Check Hawaii County Civil Defense.</li>
            </ul>
        `,
        infoHurricane: `
            <p><strong>Hurricane</strong></p>
            <ul>
                <li><strong>Shelters:</strong> Public schools/gyms are designated as "Hurricane Shelters" (Refuge Areas). Often no food/water provided (Bring your own).</li>
                <li><strong>Hotels:</strong> If in a sturdy hotel, stay indoors away from windows (Shelter in Place).</li>
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
        filterVolcanoShelters: "Volcano Shelters\n(Big Island Only)",
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
    
    updateInfoText(); // 情報テキスト更新

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
    
    const returnButton = document.getElementById("returnToCurrentLocationDisaster");
    if (returnButton) returnButton.textContent = d.returnToCurrentLocation;
    
    const naviButton = document.getElementById('googleMapsNaviButtonDisaster');
    if(naviButton) naviButton.textContent = d.googleMapsNaviButton;
}

// フィルタ状態に応じて重要情報のテキストを更新
function updateInfoText() {
    const filter = (typeof currentDisasterFilter !== 'undefined') ? currentDisasterFilter : 'all';
    const d = langDataJ[currentLang];
    const shelterEl = document.getElementById('shelter');

    switch(filter) {
        case 'tsunami':
            shelterEl.innerHTML = d.infoTsunami;
            break;
        case 'volcano':
            shelterEl.innerHTML = d.infoVolcano;
            break;
        case 'hurricane':
            shelterEl.innerHTML = d.infoHurricane;
            break;
        case 'hideAll':
            shelterEl.innerHTML = "";
            break;
        default:
            shelterEl.innerHTML = d.shelter;
            break;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateContentJ();
});
