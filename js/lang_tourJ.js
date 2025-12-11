const tourTranslations = {
  ja: {
    title: "防災×観光ピクトマップ",
    headerTitle: "防災×観光ピクトマップ",
    switchMode: "防災モードに切替",
    filterTitle: "表示カテゴリを絞り込む",
    ratingFilterTitle: "評価で絞り込む（飲食店・カフェのみ）",
    filterFoodDrink: "飲食店・カフェ",
    filterTouristAttraction: "観光名所",
    filterStore: "ショッピング",
    filterLodging: "宿泊施設",
    filterAll: "全て表示",
    filterHideAll: "非表示",
    rating4_5_5_0: "評価 4.5以上",
    rating4_0_4_5: "評価 4.0～4.5未満",
    rating3_5_4_0: "評価 3.5～4.0未満",
    rating0_0_3_5: "評価 3.5未満",
    ratingAll: "全ての評価",
    returnToCurrentLocation: "現在地に戻る",
    directionsTitleTour: "経路案内",
    startLabelTour: "出発地:",
    endLabelTour: "目的地:",
    travelModeLabelTour: "移動手段:",
    modeDrivingTour: "車",
    modeWalkingTour: "徒歩",
    modeBicyclingTour: "自転車",
    modeTransitTour: "電車・公共交通機関",
    getDirectionsButtonTour: "経路を検索",
    clearDirectionsButtonTour: "経路をクリア",
    currentLocationButton: "現在地",
    googleMapsNaviButton: "🗺️ Googleマップでナビ開始"
  },
  en: {
    title: "Disaster Prevention & Tourist Pictogram Map",
    headerTitle: "Disaster Prevention & Tourist Pictogram Map",
    switchMode: "Switch to Evacuation Mode",
    filterTitle: "Filter Display Categories",
    ratingFilterTitle: "Filter by Rating (Food & Drink only)",
    filterFoodDrink: "Food & Drink",
    filterTouristAttraction: "Tourist Attraction",
    filterStore: "Shopping",
    filterLodging: "Lodging",
    filterAll: "Show All",
    filterHideAll: "Hide All",
    rating4_5_5_0: "Rating 4.5+",
    rating4_0_4_5: "Rating 4.0-4.5",
    rating3_5_4_0: "Rating 3.5-4.0",
    rating0_0_3_5: "Rating < 3.5",
    ratingAll: "All Ratings",
    returnToCurrentLocation: "Return to Current Location",
    directionsTitleTour: "Directions",
    startLabelTour: "Origin:",
    endLabelTour: "Destination:",
    travelModeLabelTour: "Travel Mode:",
    modeDrivingTour: "Driving",
    modeWalkingTour: "Walking",
    modeBicyclingTour: "Bicycling",
    modeTransitTour: "Transit",
    getDirectionsButtonTour: "Get Directions",
    clearDirectionsButtonTour: "Clear Directions",
    currentLocationButton: "Current Location",
    googleMapsNaviButton: "🗺️ Start Navigation in Google Maps"
  }
};

function setLangTourJ(lang) {
    if (!tourTranslations[lang]) return;
    document.getElementById("title").textContent       = tourTranslations[lang].title;
    document.getElementById("headerTitle").textContent = tourTranslations[lang].headerTitle;
    document.getElementById("switchMode").textContent  = tourTranslations[lang].switchMode;
    document.getElementById("filterTitle").textContent = tourTranslations[lang].filterTitle;
    document.getElementById("ratingFilterTitle").textContent = tourTranslations[lang].ratingFilterTitle;
    document.getElementById("filterFoodDrink").textContent = tourTranslations[lang].filterFoodDrink;
    document.getElementById("filterTouristAttraction").textContent = tourTranslations[lang].filterTouristAttraction;
    document.getElementById("filterStore").textContent = tourTranslations[lang].filterStore;
    document.getElementById("filterLodging").textContent = tourTranslations[lang].filterLodging;
    document.getElementById("filterAll").textContent = tourTranslations[lang].filterAll;
    document.getElementById("filterHideAll").textContent = tourTranslations[lang].filterHideAll;
    document.getElementById("rating4_5_5_0").textContent = tourTranslations[lang].rating4_5_5_0;
    document.getElementById("rating4_0_4_5").textContent = tourTranslations[lang].rating4_0_4_5;
    document.getElementById("rating3_5_4_0").textContent = tourTranslations[lang].rating3_5_4_0;
    document.getElementById("rating0_0_3_5").textContent = tourTranslations[lang].rating0_0_3_5;
    document.getElementById("ratingAll").textContent = tourTranslations[lang].ratingAll;

    const returnButton = document.getElementById("returnToCurrentLocationTour");
    if (returnButton) {
        returnButton.textContent = tourTranslations[lang].returnToCurrentLocation;
    }

    const directionsTitleTour = document.getElementById('directionsTitleTour');
    if (directionsTitleTour) directionsTitleTour.textContent = tourTranslations[lang].directionsTitleTour;
    const startLabelTour = document.getElementById('startLabelTour');
    if (startLabelTour) startLabelTour.textContent = tourTranslations[lang].startLabelTour;
    const endLabelTour = document.getElementById('endLabelTour');
    if (endLabelTour) endLabelTour.textContent = tourTranslations[lang].endLabelTour;
    const travelModeLabelTour = document.getElementById('travelModeLabelTour');
    if (travelModeLabelTour) travelModeLabelTour.textContent = tourTranslations[lang].travelModeLabelTour;
    const modeDrivingTour = document.getElementById('modeDrivingTour');
    if (modeDrivingTour) modeDrivingTour.textContent = tourTranslations[lang].modeDrivingTour;
    const modeWalkingTour = document.getElementById('modeWalkingTour');
    if (modeWalkingTour) modeWalkingTour.textContent = tourTranslations[lang].modeWalkingTour;
    const modeBicyclingTour = document.getElementById('modeBicyclingTour');
    if (modeBicyclingTour) modeBicyclingTour.textContent = tourTranslations[lang].modeBicyclingTour;
    const modeTransitTour = document.getElementById('modeTransitTour');
    if (modeTransitTour) modeTransitTour.textContent = tourTranslations[lang].modeTransitTour;
    const getDirectionsButtonTour = document.getElementById('getDirectionsButtonTour');
    if (getDirectionsButtonTour) getDirectionsButtonTour.textContent = tourTranslations[lang].getDirectionsButtonTour;
    const clearDirectionsButtonTour = document.getElementById('clearDirectionsButtonTour');
    if (clearDirectionsButtonTour) clearDirectionsButtonTour.textContent = tourTranslations[lang].clearDirectionsButtonTour;
    const currentLocationStartButtonTour = document.getElementById('currentLocationStartButtonTour');
    if (currentLocationStartButtonTour) currentLocationStartButtonTour.textContent = tourTranslations[lang].currentLocationButton;
    const currentLocationEndButtonTour = document.getElementById('currentLocationEndButtonTour');
    if (currentLocationEndButtonTour) currentLocationEndButtonTour.textContent = tourTranslations[lang].currentLocationButton;
    
    const naviButton = document.getElementById('googleMapsNaviButtonTour');
    if(naviButton) naviButton.textContent = tourTranslations[lang].googleMapsNaviButton;
}
setLangTourJ('ja');
