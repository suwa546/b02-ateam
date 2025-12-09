// js/langJ.js

let currentLang = 'ja';

const langDataJ = {
    ja: {
        headerTitle: "防災モード",
        alertMsg: "現在、防災モードが有効です。避難情報と災害警報にご注意ください。",
        switchMode: "通常モードに切替",
        infoTitle: "重要情報",
        shelter: "避難所を地図上に表示しています。最寄りの避難場所を確認してください。",
        returnToCurrentLocation: "現在地に戻る",
        legendTitle: "ピクトグラム凡例",
        legendHospital: '<span style="display:inline-block;width:20px;height:20px;background:#007bff;color:white;text-align:center;line-height:20px;border-radius:50%;font-size:14px;">＋</span> ：病院',
        legendOtherShelter: '<span style="display:inline-block;width:20px;height:20px;background:#28a745;color:white;text-align:center;line-height:20px;border-radius:50%;font-size:12px;">避</span> ：避難所（学校・公民館等）',
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
        filterFireShelters: "火災避難所 (沿岸10km以内)",
        filterTsunamiShelters: "津波避難所 (沿岸10km以遠)",
        filterVolcanoShelters: "火山噴火避難所",
        filterHurricaneShelters: "ハリケーン避難所 (沿岸5km以遠)",
        filterAllDisasters: "全て表示",
        filterHideAllDisasters: "非表示",
        disasterInfo1: "",
        disasterInfo2: "",
        disasterInfo3: ""
    },
    en: {
        headerTitle: "Disaster Prevention Mode",
        alertMsg: "Disaster prevention mode is currently active. Please pay attention to evacuation information and disaster warnings.",
        switchMode: "Switch to Normal Mode",
        infoTitle: "Important Information",
        shelter: "Evacuation shelters are shown on the map. Please check your nearest evacuation point.",
        returnToCurrentLocation: "Return to Current Location",
        legendTitle: "Pictogram Legend",
        legendHospital: '<span style="display:inline-block;width:20px;height:20px;background:#007bff;color:white;text-align:center;line-height:20px;border-radius:50%;font-size:14px;">+</span> : Hospital',
        legendOtherShelter: '<span style="display:inline-block;width:20px;height:20px;background:#28a745;color:white;text-align:center;line-height:20px;border-radius:50%;font-size:12px;">!</span> : Shelter (School/Center etc)',
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
        filterFireShelters: "Fire Shelters (< 10km from coast)",
        filterTsunamiShelters: "Tsunami Shelters (> 10km from coast)",
        filterVolcanoShelters: "Volcano Shelters",
        filterHurricaneShelters: "Hurricane Shelters (> 5km from coast)",
        filterAllDisasters: "Show All",
        filterHideAllDisasters: "Hide All",
        disasterInfo1: "",
        disasterInfo2: "",
        disasterInfo3: ""
    }
};

function setLangJ(lang) {
    currentLang = lang;
    updateContentJ();
    if (typeof updateDisasterInfo === 'function') {
        updateDisasterInfo(currentDisasterFilter || 'all');
    }
}

function updateContentJ() {
    document.getElementById("title").textContent = langDataJ[currentLang].headerTitle;
    const headerTitle = document.getElementById('headerTitle');
    if (headerTitle) headerTitle.textContent = langDataJ[currentLang].headerTitle;

    const alertMsg = document.getElementById('alertMsg');
    if (alertMsg) alertMsg.textContent = langDataJ[currentLang].alertMsg;

    const switchMode = document.getElementById('switchMode');
    if (switchMode) switchMode.textContent = langDataJ[currentLang].switchMode;

    const infoTitle = document.getElementById('infoTitle');
    if (infoTitle) infoTitle.textContent = langDataJ[currentLang].infoTitle;

    const shelterElement = document.getElementById('shelter');
    if (shelterElement) shelterElement.innerHTML = langDataJ[currentLang].shelter;

    const returnButton = document.getElementById("returnToCurrentLocationDisaster");
    if (returnButton) returnButton.textContent = langDataJ[currentLang].returnToCurrentLocation;

    const legendTitle = document.getElementById('legendTitle');
    if (legendTitle) legendTitle.textContent = langDataJ[currentLang].legendTitle;
    
    const legendHospital = document.getElementById('legendHospital');
    if (legendHospital) legendHospital.innerHTML = langDataJ[currentLang].legendHospital;
    
    const legendOtherShelter = document.getElementById('legendOtherShelter');
    if (legendOtherShelter) legendOtherShelter.innerHTML = langDataJ[currentLang].legendOtherShelter;

    const disasterFilterTitle = document.getElementById('disasterFilterTitle');
    if (disasterFilterTitle) disasterFilterTitle.textContent = langDataJ[currentLang].disasterFilterTitle;
    
    const filterFireShelters = document.getElementById('filterFireShelters');
    if (filterFireShelters) filterFireShelters.textContent = langDataJ[currentLang].filterFireShelters;
    const filterTsunamiShelters = document.getElementById('filterTsunamiShelters');
    if (filterTsunamiShelters) filterTsunamiShelters.textContent = langDataJ[currentLang].filterTsunamiShelters;
    const filterVolcanoShelters = document.getElementById('filterVolcanoShelters');
    if (filterVolcanoShelters) filterVolcanoShelters.textContent = langDataJ[currentLang].filterVolcanoShelters;
    const filterHurricaneShelters = document.getElementById('filterHurricaneShelters');
    if (filterHurricaneShelters) filterHurricaneShelters.textContent = langDataJ[currentLang].filterHurricaneShelters;
    const filterAllDisasters = document.getElementById('filterAllDisasters');
    if (filterAllDisasters) filterAllDisasters.textContent = langDataJ[currentLang].filterAllDisasters;
    const filterHideAllDisasters = document.getElementById('filterHideAllDisasters');
    if (filterHideAllDisasters) filterHideAllDisasters.textContent = langDataJ[currentLang].filterHideAllDisasters;

    const directionsTitle = document.getElementById('directionsTitle');
    if (directionsTitle) directionsTitle.textContent = langDataJ[currentLang].directionsTitle;
    const startLabel = document.getElementById('startLabel');
    if (startLabel) startLabel.textContent = langDataJ[currentLang].startLabel;
    const endLabel = document.getElementById('endLabel');
    if (endLabel) endLabel.textContent = langDataJ[currentLang].endLabel;
    const travelModeLabel = document.getElementById('travelModeLabel');
    if (travelModeLabel) travelModeLabel.textContent = langDataJ[currentLang].travelModeLabel;
    const modeDriving = document.getElementById('modeDriving');
    if (modeDriving) modeDriving.textContent = langDataJ[currentLang].modeDriving;
    const modeWalking = document.getElementById('modeWalking');
    if (modeWalking) modeWalking.textContent = langDataJ[currentLang].modeWalking;
    const modeBicycling = document.getElementById('modeBicycling');
    if (modeBicycling) modeBicycling.textContent = langDataJ[currentLang].modeBicycling;
    const modeTransit = document.getElementById('modeTransit');
    if (modeTransit) modeTransit.textContent = langDataJ[currentLang].modeTransit;
    const getDirectionsButton = document.getElementById('getDirectionsButton');
    if (getDirectionsButton) getDirectionsButton.textContent = langDataJ[currentLang].getDirectionsButton;
    const clearDirectionsButton = document.getElementById('clearDirectionsButton');
    if (clearDirectionsButton) clearDirectionsButton.textContent = langDataJ[currentLang].clearDirectionsButton;
    const currentLocationStartButtonDisaster = document.getElementById('currentLocationStartButtonDisaster');
    if (currentLocationStartButtonDisaster) currentLocationStartButtonDisaster.textContent = langDataJ[currentLang].currentLocationButton;
    const currentLocationEndButtonDisaster = document.getElementById('currentLocationEndButtonDisaster');
    if (currentLocationEndButtonDisaster) currentLocationEndButtonDisaster.textContent = langDataJ[currentLang].currentLocationButton;
    
    const naviButton = document.getElementById('googleMapsNaviButtonDisaster');
    if(naviButton) naviButton.textContent = langDataJ[currentLang].googleMapsNaviButton;
}

document.addEventListener('DOMContentLoaded', () => {
    updateContentJ();
    if (typeof updateDisasterInfo === 'function') {
        updateDisasterInfo('all');
    }
});