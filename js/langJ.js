// js/langJ.js

let currentLang = 'ja';

const langDataJ = {
    ja: {
        headerTitle: "防災モード",
        alertMsg: "現在、防災モードが有効です。避難情報と災害警報にご注意ください。",
        switchMode: "通常モードに切替",
        infoTitle: "重要情報・公式リンク",
        shelter: "避難所を地図上に表示しています。最寄りの避難場所を確認してください。",
        returnToCurrentLocation: "現在地に戻る",
        legendTitle: "マップアイコン凡例",
        // ★ 画像アイコンに変更
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
        
        // 公式リンクのタイトル
        linkTitleAll: "ハワイ州 緊急事態管理庁 (HI-EMA)",
        linkTitleTsunami: "NOAA 太平洋津波警報センター",
        linkTitleVolcano: "USGS ハワイ火山観測所",
        linkTitleHurricane: "NOAA 中部太平洋ハリケーンセンター"
    },
    en: {
        headerTitle: "Disaster Prevention Mode",
        alertMsg: "Disaster prevention mode is currently active. Please pay attention to evacuation information and disaster warnings.",
        switchMode: "Switch to Normal Mode",
        infoTitle: "Important Info & Official Links",
        shelter: "Evacuation shelters are shown on the map. Please check your nearest evacuation point.",
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

// 公式リンクのURL定義
const officialLinks = {
    all: "https://dod.hawaii.gov/hiema/",
    tsunami: "https://www.tsunami.gov/",
    volcano: "https://www.usgs.gov/observatories/hvo",
    hurricane: "https://www.nhc.noaa.gov/?cpac"
};

function setLangJ(lang) {
    currentLang = lang;
    updateContentJ();
    // 言語切り替え時に現在のフィルタ状態のテキストも更新
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
    document.getElementById('shelter').innerHTML = d.shelter;
    
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
    
    // 他の要素も同様に更新
    const returnButton = document.getElementById("returnToCurrentLocationDisaster");
    if (returnButton) returnButton.textContent = d.returnToCurrentLocation;
    
    const naviButton = document.getElementById('googleMapsNaviButtonDisaster');
    if(naviButton) naviButton.textContent = d.googleMapsNaviButton;
}

document.addEventListener('DOMContentLoaded', () => {
    updateContentJ();
});
