/* map_disasterJ.js */

let mapDisaster;
let disasterMarkers = [];
let allDisasterPlaces = []; 
let disasterPlacesService;
let userCurrentLocationDisaster = null;
let userLocationCircleDisaster;
let disasterInfoWindow;
let disasterDirectionsService;
let disasterDirectionsRenderer;
let disasterGeocoder;
let exclusionPolygons = []; 

// ■ 固定避難所・病院リスト
const FIXED_SHELTER_DATA = [
    // ... (前回のリストと同じ内容) ...
    { name: "The Queen's Medical Center", lat: 21.3072, lng: -157.8556, island: "Oahu", type: "hospital" },
    { name: "Straub Medical Center", lat: 21.3045, lng: -157.8496, island: "Oahu", type: "hospital" },
    { name: "Kapiolani Medical Center", lat: 21.3015, lng: -157.8396, island: "Oahu", type: "hospital" },
    { name: "Kaiser Permanente Moanalua Medical Center", lat: 21.3575, lng: -157.8943, island: "Oahu", type: "hospital" },
    { name: "Adventist Health Castle", lat: 21.3853, lng: -157.7562, island: "Oahu", type: "hospital" },
    { name: "Pali Momi Medical Center", lat: 21.3860, lng: -157.9427, island: "Oahu", type: "hospital" },
    { name: "The Queen's Medical Center - West Oahu", lat: 21.3486, lng: -158.0305, island: "Oahu", type: "hospital" },
    { name: "Hawaii Convention Center", lat: 21.2905, lng: -157.8365, island: "Oahu", type: "shelter" },
    { name: "Neal S. Blaisdell Center", lat: 21.3000, lng: -157.8500, island: "Oahu", type: "shelter" },
    { name: "Leilehua High School", lat: 21.5000, lng: -158.0700, island: "Oahu", type: "shelter" },
    { name: "Farrington High School", lat: 21.3280, lng: -157.8730, island: "Oahu", type: "shelter" },
    { name: "McKinley High School", lat: 21.2980, lng: -157.8470, island: "Oahu", type: "shelter" },
    { name: "Hilo Medical Center", lat: 19.7150, lng: -155.1080, island: "Hawaii", type: "hospital" },
    { name: "Kona Community Hospital", lat: 19.5330, lng: -155.9330, island: "Hawaii", type: "hospital" },
    { name: "Pahoa Community Center", lat: 19.5033, lng: -154.9535, island: "Hawaii", type: "shelter" },
    { name: "Keaau High School", lat: 19.6416, lng: -155.0425, island: "Hawaii", type: "shelter" },
    { name: "Hilo High School", lat: 19.7208, lng: -155.0933, island: "Hawaii", type: "shelter" },
    { name: "Waiakea High School", lat: 19.6995, lng: -155.0830, island: "Hawaii", type: "shelter" },
    { name: "Old Kona Airport (Kailua Park)", lat: 19.6450, lng: -156.0050, island: "Hawaii", type: "shelter" },
    { name: "Kealakehe High School", lat: 19.6675, lng: -156.0120, island: "Hawaii", type: "shelter" },
    { name: "Ka'u District Gym", lat: 19.1950, lng: -155.4750, island: "Hawaii", type: "shelter" },
    { name: "Honokaa High School", lat: 20.0760, lng: -155.4650, island: "Hawaii", type: "shelter" },
    { name: "Maui Memorial Medical Center", lat: 20.8850, lng: -156.4850, island: "Maui", type: "hospital" },
    { name: "Maui High School", lat: 20.8753, lng: -156.4633, island: "Maui", type: "shelter" },
    { name: "Baldwin High School", lat: 20.8833, lng: -156.4917, island: "Maui", type: "shelter" },
    { name: "Lahaina Civic Center", lat: 20.9100, lng: -156.6800, island: "Maui", type: "shelter" },
    { name: "King Kekaulike High School", lat: 20.8500, lng: -156.3300, island: "Maui", type: "shelter" },
    { name: "Wilcox Medical Center", lat: 21.9800, lng: -159.3700, island: "Kauai", type: "hospital" },
    { name: "Kauai High School", lat: 21.9700, lng: -159.3600, island: "Kauai", type: "shelter" },
    { name: "Kapaa High School", lat: 22.0800, lng: -159.3200, island: "Kauai", type: "shelter" },
    { name: "Island School", lat: 21.9600, lng: -159.3900, island: "Kauai", type: "shelter" }
];

const filterButtonIds = {
    'tsunami': 'filterTsunamiShelters',
    'volcano': 'filterVolcanoShelters',
    'hurricane': 'filterHurricaneShelters',
    'all': 'filterAllDisasters',
    'hideAll': 'filterHideAllDisasters'
};

function updateFilterButtonStyles(activeType) {
    Object.values(filterButtonIds).forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.remove('active-filter');
    });
    const activeId = filterButtonIds[activeType];
    if (activeId) {
        const activeBtn = document.getElementById(activeId);
        if (activeBtn) activeBtn.classList.add('active-filter');
    }
}

// 言語切り替え時にステータス文字も更新するための関数
function updateFilterStatusText() {
    const statusTextElement = document.getElementById('currentFilterName');
    const d = langDataJ[currentLang];
    let text = "";
    
    switch(currentDisasterFilter) {
        case 'tsunami': text = d.filterTsunamiShelters; break;
        case 'volcano': text = d.filterVolcanoShelters; break;
        case 'hurricane': text = d.filterHurricaneShelters; break;
        case 'all': text = d.filterAllDisasters; break;
        case 'hideAll': text = d.filterHideAllDisasters; break;
        default: text = d.filterAllDisasters;
    }
    statusTextElement.textContent = text.replace(/\n/g, " "); // 改行削除
    updateOfficialLink(); // リンクも更新
}

// 公式リンクを更新する関数
function updateOfficialLink() {
    const linkItem = document.getElementById('officialLinkItem');
    const d = langDataJ[currentLang];
    let url = "";
    let title = "";

    switch(currentDisasterFilter) {
        case 'tsunami': 
            url = officialLinks.tsunami; 
            title = d.linkTitleTsunami; 
            break;
        case 'volcano': 
            url = officialLinks.volcano; 
            title = d.linkTitleVolcano; 
            break;
        case 'hurricane': 
            url = officialLinks.hurricane; 
            title = d.linkTitleHurricane; 
            break;
        default: 
            url = officialLinks.all; 
            title = d.linkTitleAll; 
            break;
    }

    if (currentDisasterFilter === 'hideAll') {
        linkItem.innerHTML = "";
    } else {
        linkItem.innerHTML = `<a href="${url}" target="_blank" style="color:#007bff; text-decoration:none; font-weight:bold;">🔗 ${title}</a>`;
    }
}

async function initMapDisaster() {
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
    const { PlacesService, Autocomplete } = await google.maps.importLibrary("places");
    const { DirectionsService, DirectionsRenderer } = await google.maps.importLibrary("routes");
    const { Geocoder } = await google.maps.importLibrary("geocoding");
    
    const initialLat = 21.48; 
    const initialLon = -157.95;
    const initialZoom = 10; 
    
    mapDisaster = new Map(document.getElementById('map'), {
        center: { lat: initialLat, lng: initialLon },
        zoom: initialZoom,
        mapTypeId: 'roadmap',
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        mapId: "40ca9d23eb95bcf78932c38e",
        gestureHandling: 'greedy',
        clickableIcons: false,
    });

    if (typeof tsunamiData !== 'undefined') {
        mapDisaster.data.addGeoJson(tsunamiData);
        mapDisaster.data.setStyle({ visible: false });
        processGeoJsonToPolygons(tsunamiData);
    }

    disasterPlacesService = new PlacesService(mapDisaster);
    disasterInfoWindow = new google.maps.InfoWindow({ maxWidth: 280 });
    mapDisaster.addListener('click', () => disasterInfoWindow.close());
    
    disasterDirectionsService = new DirectionsService();
    disasterDirectionsRenderer = new DirectionsRenderer({ map: mapDisaster, panel: document.getElementById('directionsPanelDisaster') });
    disasterGeocoder = new Geocoder();

    // 初期状態セット
    updateFilterButtonStyles('all');
    updateFilterStatusText();

    function drawUserLocationCircleDisaster(center) {
        if (userLocationCircleDisaster) {
            userLocationCircleDisaster.setMap(null);
        }
        userLocationCircleDisaster = new google.maps.Circle({
            strokeColor: '#4285F4',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#4285F4',
            fillOpacity: 0.35,
            map: mapDisaster,
            center: center,
            radius: 50
        });
    }
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
                userCurrentLocationDisaster = pos;
                mapDisaster.setCenter(pos); mapDisaster.setZoom(13);
                drawUserLocationCircleDisaster(pos);
                searchPlacesDisaster(pos, 5000);
            },
            async (error) => {
                searchPlacesDisaster({ lat: 21.3069, lng: -157.8583 }, 5000);
            }
        );
    } else {
        searchPlacesDisaster({ lat: 21.3069, lng: -157.8583 }, 5000);
    }
    
    const searchInput = document.createElement('input');
    searchInput.id = 'mapSearchInput';
    searchInput.placeholder = '地域や避難所を検索';
    searchInput.style.cssText = 'width: calc(100% - 20px); padding: 10px; margin: 10px; border: 1px solid #ccc; border-radius: 8px; font-size: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);';
    mapDisaster.controls[google.maps.ControlPosition.TOP_CENTER].push(searchInput);
    
    const autocomplete = new Autocomplete(searchInput, { types: ['geocode', 'establishment'] });
    autocomplete.bindTo("bounds", mapDisaster);
    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) { return; }
        if (place.geometry.viewport) { mapDisaster.fitBounds(place.geometry.viewport); } else { mapDisaster.setCenter(place.geometry.location); mapDisaster.setZoom(14); }
        
        clearDisasterMarkers();
        allDisasterPlaces = [];
        processedDisasterPlaceIds.clear();
        searchPlacesDisaster(place.geometry.location, 5000);
    });
    
    const returnButton = document.createElement('button');
    returnButton.id = 'returnToCurrentLocationDisaster';
    returnButton.textContent = '現在地に戻る';
    returnButton.className = 'map-control-button';
    returnButton.addEventListener('click', async () => {
        if (userCurrentLocationDisaster) {
            mapDisaster.setCenter(userCurrentLocationDisaster); mapDisaster.setZoom(14);
            if (currentDisasterFilter !== 'volcano') {
                clearDisasterMarkers();
                allDisasterPlaces = [];
                processedDisasterPlaceIds.clear();
                searchPlacesDisaster(userCurrentLocationDisaster, 5000);
            }
            drawUserLocationCircleDisaster(userCurrentLocationDisaster);
        }
    });
    mapDisaster.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(returnButton);
    
    mapDisaster.addListener('idle', () => {
        if (currentDisasterFilter !== 'volcano') {
            const zoomLevel = mapDisaster.getZoom();
            if (zoomLevel >= 11) {
                const newCenter = mapDisaster.getCenter();
                searchPlacesDisaster(newCenter, 5000);
            }
        }
    });

    const startInputDisaster = document.getElementById('startDisaster');
    const endInputDisaster = document.getElementById('endDisaster');
    new Autocomplete(startInputDisaster, { types: ['geocode', 'establishment'] }).bindTo('bounds', mapDisaster);
    new Autocomplete(endInputDisaster, { types: ['geocode', 'establishment'] }).bindTo('bounds', mapDisaster);
}

function processGeoJsonToPolygons(geoJson) {
    if (!geoJson || !geoJson.features) return;
    geoJson.features.forEach(feature => {
        const geometry = feature.geometry;
        if (!geometry) return;
        if (geometry.type === 'Polygon') {
            createPolygonFromCoords(geometry.coordinates);
        } else if (geometry.type === 'MultiPolygon') {
            geometry.coordinates.forEach(polygonCoords => {
                createPolygonFromCoords(polygonCoords);
            });
        }
    });
}

function createPolygonFromCoords(coordinates) {
    const path = coordinates[0].map(coord => ({ lat: coord[1], lng: coord[0] }));
    const polygon = new google.maps.Polygon({ paths: path });
    exclusionPolygons.push(polygon);
}

function isLocationInsideHazardZone(lat, lng) {
    if (exclusionPolygons.length === 0) return false;
    const latLng = new google.maps.LatLng(lat, lng);
    for (let i = 0; i < exclusionPolygons.length; i++) {
        if (google.maps.geometry.poly.containsLocation(latLng, exclusionPolygons[i])) {
            return true;
        }
    }
    return false;
}

let processedDisasterPlaceIds = new Set();
let currentDisasterFilter = 'all';

function searchPlacesDisaster(center, radius) {
    if (!disasterPlacesService) return;
    const request = {
        location: center,
        radius: radius,
        keyword: "school OR community center OR park OR gym OR hospital OR church OR medical center OR clinic" 
    };
    
    disasterPlacesService.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            for (const place of results) {
                if (place.place_id && !processedDisasterPlaceIds.has(place.place_id)) {
                    processedDisasterPlaceIds.add(place.place_id);
                    allDisasterPlaces.push(place);
                    
                    if (shouldDisplayPlace(place, currentDisasterFilter)) {
                        createDisasterMarker(place);
                    }
                }
            }
        }
    });

    if (currentDisasterFilter === 'all' || currentDisasterFilter === 'tsunami') {
        FIXED_SHELTER_DATA.forEach(data => {
            if (currentDisasterFilter === 'tsunami') {
                if (data.type === 'hospital') {
                    createManualMarker(data);
                } else if (!isLocationInsideHazardZone(data.lat, data.lng)) {
                     createManualMarker(data);
                }
            } else {
                createManualMarker(data);
            }
        });
    }
}

function shouldDisplayPlace(place, filterType) {
    if (!place.geometry || !place.geometry.location) return false;
    const placeTypes = place.types || [];
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    
    const isShelterCandidate = placeTypes.includes('school') || 
                               placeTypes.includes('community_center') || 
                               placeTypes.includes('local_government_office') ||
                               placeTypes.includes('gym') ||
                               placeTypes.includes('church') ||
                               placeTypes.includes('place_of_worship');
                               
    const isHospital = placeTypes.includes('hospital') || 
                       placeTypes.includes('doctor') || 
                       placeTypes.includes('health') || 
                       placeTypes.includes('physiotherapist');

    if (filterType === 'tsunami') {
         if (placeTypes.includes('park') || placeTypes.includes('campground') || placeTypes.includes('rv_park')) {
            return false;
        }
        if (isHospital) return true;
        if (isLocationInsideHazardZone(lat, lng)) {
            return false;
        }
    }

    if (filterType === 'volcano') return false; 
    if (filterType === 'hideAll') return false;

    return isShelterCandidate || isHospital;
}

function filterDisasterMarkers(selectedTypes, filterType) {
    clearDisasterMarkers();
    currentDisasterFilter = filterType;
    updateFilterButtonStyles(filterType);
    updateFilterStatusText(); // ステータス文字とリンクの更新
    
    const alertMsg = document.getElementById('alertMsg');
    const hazardSection = document.getElementById('hazardSection'); // ハザードマップ凡例エリア

    if (filterType === 'tsunami') {
        mapDisaster.data.setStyle({
            visible: true,
            fillColor: '#FF0000',
            fillOpacity: 0.3,
            strokeColor: '#FF0000',
            strokeWeight: 1,
            clickable: false
        });
        
        if (alertMsg) alertMsg.textContent = "津波避難モード: 浸水想定区域（赤色）以外の避難所・病院を表示しています。";
        hazardSection.style.display = 'block'; // ハザードマップ凡例を表示

        FIXED_SHELTER_DATA.forEach(data => {
            if (data.type === 'hospital') {
                createManualMarker(data);
            } else if (!isLocationInsideHazardZone(data.lat, data.lng)) {
                createManualMarker(data);
            }
        });

        if (allDisasterPlaces.length === 0) {
            searchPlacesDisaster(mapDisaster.getCenter(), 5000);
        } else {
            allDisasterPlaces.forEach(place => {
                if (shouldDisplayPlace(place, 'tsunami')) createDisasterMarker(place);
            });
        }
    } 
    else if (filterType === 'volcano') {
        mapDisaster.data.setStyle({ visible: false });
        if (alertMsg) alertMsg.textContent = "火山避難モード: ハワイ島の主要な避難所を表示しています。";
        hazardSection.style.display = 'none';
        
        mapDisaster.setCenter({ lat: 19.65, lng: -155.5 });
        mapDisaster.setZoom(9);
        
        FIXED_SHELTER_DATA.forEach(data => {
            if (data.island === "Hawaii") createManualMarker(data);
        });
    } 
    else if (filterType === 'all' || filterType === 'hurricane') {
        mapDisaster.data.setStyle({ visible: false });
        if (alertMsg) alertMsg.textContent = "現在、防災モードが有効です。全ての避難所と病院を表示しています。";
        hazardSection.style.display = 'none';

        FIXED_SHELTER_DATA.forEach(data => createManualMarker(data));

        if (allDisasterPlaces.length === 0) {
            searchPlacesDisaster(mapDisaster.getCenter(), 5000);
        } else {
            allDisasterPlaces.forEach(place => {
                if (shouldDisplayPlace(place, filterType)) createDisasterMarker(place);
            });
        }
    }
    else {
        mapDisaster.data.setStyle({ visible: false });
        hazardSection.style.display = 'none';
    }
}

async function createManualMarker(data) {
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
    
    const icon = document.createElement('img');
    if (data.type === 'hospital') {
        icon.src = 'img/byoin.png';
    } else {
        icon.src = 'img/hinan.png';
    }
    icon.style.width = '35px';
    icon.style.height = '35px';
    icon.style.objectFit = 'contain';

    const marker = new AdvancedMarkerElement({ 
        map: mapDisaster, 
        position: { lat: data.lat, lng: data.lng }, 
        title: data.name, 
        content: icon
    });
    disasterMarkers.push(marker);
    marker.addListener('click', () => {
        const typeLabel = (data.type === 'hospital') ? '病院・医療機関' : '指定避難所';
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.name)}`;
        const infoContent = `<div style="font-family: sans-serif; font-size: 14px; line-height: 1.5;"><h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${data.name}</h3><p style="margin: 0 0 8px 0; color: #555;"><strong>種別:</strong> ${typeLabel} (${data.island})</p><button onclick="document.getElementById('endDisaster').value = '${data.name}'" style="padding: 6px 10px; cursor: pointer; margin-right:5px;">目的地に設定</button><a href="${mapsUrl}" target="_blank" style="color: #1a73e8;">Google マップで見る</a></div>`;
        disasterInfoWindow.setContent(infoContent);
        disasterInfoWindow.open(mapDisaster, marker);
    });
}

async function createDisasterMarker(place) {
    if (!place.geometry || !place.geometry.location) return;
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    
    const types = place.types;
    let isHospital = types.includes('hospital') || types.includes('doctor') || types.includes('health');
    let categoryName = isHospital ? '病院・医療機関' : '避難所';

    const icon = document.createElement('img');
    if (isHospital) {
        icon.src = 'img/byoin.png';
    } else {
        icon.src = 'img/hinan.png';
    }
    icon.style.width = '35px';
    icon.style.height = '35px';
    icon.style.objectFit = 'contain';

    const marker = new AdvancedMarkerElement({ 
        map: mapDisaster, position: place.geometry.location, title: place.name, content: icon
    });
    
    marker.placeAddress = place.formatted_address || "";
    disasterMarkers.push(marker);
    
    marker.addListener('click', () => {
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`;
        const encodedAddress = encodeURIComponent(place.formatted_address || place.name).replace(/'/g, "\\'");
        const infoContent = `<div style="font-family: sans-serif; font-size: 14px; line-height: 1.5;"><h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${place.name}</h3><p style="margin: 0 0 8px 0; color: #555;"><strong>カテゴリ:</strong> ${categoryName}</p><p style="margin: 0 0 8px 0; font-size: 12px;">${place.formatted_address || ''}</p><div style="display:flex; gap:5px; flex-wrap:wrap;"><button onclick="document.getElementById('startDisaster').value = decodeURIComponent('${encodedAddress}');" style="padding: 6px 10px; cursor: pointer;">ここを出発地</button><button onclick="document.getElementById('endDisaster').value = decodeURIComponent('${encodedAddress}');" style="padding: 6px 10px; cursor: pointer;">ここを目的地</button></div><a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" style="color: #1a73e8;">Google マップで詳細</a></div>`;
        disasterInfoWindow.setContent(infoContent);
        disasterInfoWindow.open(mapDisaster, marker);
    });
}

function clearDisasterMarkers() {
    for (const marker of disasterMarkers) marker.map = null;
    disasterMarkers = [];
    if (disasterInfoWindow) disasterInfoWindow.close();
}

function calcRouteDisaster() {
    const start = document.getElementById('startDisaster').value;
    const end = document.getElementById('endDisaster').value;
    const travelMode = document.getElementById('travelModeDisaster').value;
    if (!start || !end) { alert('出発地と目的地を入力してください。'); return; }
    const request = { origin: start, destination: end, travelMode: google.maps.TravelMode[travelMode] };
    disasterDirectionsService.route(request, (result, status) => {
        if (status === 'OK') {
            disasterDirectionsRenderer.setDirections(result);
            document.getElementById('googleMapsNaviButtonDisaster').style.display = 'inline-block';
        } else { alert('経路が見つかりませんでした: ' + status); }
    });
}

function clearDirectionsDisaster() {
    disasterDirectionsRenderer.setDirections({ routes: [] });
    document.getElementById('directionsPanelDisaster').innerHTML = '';
    document.getElementById('startDisaster').value = '';
    document.getElementById('endDisaster').value = '';
    document.getElementById('googleMapsNaviButtonDisaster').style.display = 'none';
}

function openGoogleMapsNaviDisaster() {
    const start = document.getElementById('startDisaster').value;
    const end = document.getElementById('endDisaster').value;
    const travelMode = document.getElementById('travelModeDisaster').value.toLowerCase();
    if (!end) { alert("目的地が設定されていません。"); return; }
    let url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(end)}&travelmode=${travelMode}`;
    if (start) url += `&origin=${encodeURIComponent(start)}`;
    window.open(url, '_blank');
}

function getCurrentLocationForDirectionsDisaster(inputId) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
            disasterGeocoder.geocode({ 'location': pos }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    document.getElementById(inputId).value = results[0].formatted_address;
                } else { document.getElementById(inputId).value = `${pos.lat}, ${pos.lng}`; }
            });
        }, () => console.warn("現在地取得エラー"));
    }
}
