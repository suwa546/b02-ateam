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
let exclusionPolygons = []; // 除外判定用のポリゴン配列

// ■ 火山避難所データ（ハワイ島） - 固定リスト
const VOLCANO_SHELTER_DATA = [
    { name: "Pahoa Community Center", lat: 19.5033, lng: -154.9535 },
    { name: "Keaau High School", lat: 19.6416, lng: -155.0425 },
    { name: "Keaau Armory", lat: 19.6380, lng: -155.0450 },
    { name: "Hilo High School", lat: 19.7208, lng: -155.0933 },
    { name: "Waiakea High School", lat: 19.6995, lng: -155.0830 },
    { name: "Old Kona Airport (Kailua Park)", lat: 19.6450, lng: -156.0050 },
    { name: "Kealakehe High School", lat: 19.6675, lng: -156.0120 },
    { name: "Ka'u District Gym", lat: 19.1950, lng: -155.4750 },
    { name: "Pahala Community Center", lat: 19.2020, lng: -155.4780 },
    { name: "Honokaa High School", lat: 20.0760, lng: -155.4650 },
    { name: "Mountain View Elementary", lat: 19.5510, lng: -155.1110 },
    { name: "Sure Foundation Church", lat: 19.5760, lng: -155.0190 }
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

async function initMapDisaster() {
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
    const { PlacesService, Autocomplete } = await google.maps.importLibrary("places");
    const { DirectionsService, DirectionsRenderer } = await google.maps.importLibrary("routes");
    const { Geocoder } = await google.maps.importLibrary("geocoding");
    // containsLocationを使うためにgeometryライブラリが必要
    
    const initialLat = 21.3069;
    const initialLon = -157.8583;
    const initialZoom = 13;
    
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

    // ★ ハザードマップデータの読み込みとポリゴン変換処理
    if (typeof tsunamiData !== 'undefined') {
        // 1. 表示用データレイヤー
        mapDisaster.data.addGeoJson(tsunamiData);
        mapDisaster.data.setStyle({ visible: false });

        // 2. 判定用ポリゴンの作成 (containsLocation用)
        processGeoJsonToPolygons(tsunamiData);
    } else {
        console.warn("ハザードマップデータ(tsunamiData)が読み込まれていません。");
    }

    disasterPlacesService = new PlacesService(mapDisaster);
    disasterInfoWindow = new google.maps.InfoWindow({ maxWidth: 280 });
    mapDisaster.addListener('click', () => disasterInfoWindow.close());
    
    disasterDirectionsService = new DirectionsService();
    disasterDirectionsRenderer = new DirectionsRenderer({ map: mapDisaster, panel: document.getElementById('directionsPanelDisaster') });
    disasterGeocoder = new Geocoder();

    updateFilterButtonStyles('all');

    // ★ 現在地マーカー（青色に変更）
    function drawUserLocationCircleDisaster(center) {
        if (userLocationCircleDisaster) {
            userLocationCircleDisaster.setMap(null);
        }
        userLocationCircleDisaster = new google.maps.Circle({
            strokeColor: '#4285F4', // 青
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#4285F4', // 青
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
                mapDisaster.setCenter(pos); mapDisaster.setZoom(14);
                drawUserLocationCircleDisaster(pos);
                searchPlacesDisaster(pos, 5000);
            },
            async (error) => {
                const initialCenter = mapDisaster.getCenter();
                userCurrentLocationDisaster = initialCenter;
                drawUserLocationCircleDisaster(initialCenter);
                searchPlacesDisaster(initialCenter, 5000);
            }
        );
    } else {
        const initialCenter = mapDisaster.getCenter();
        userCurrentLocationDisaster = initialCenter;
        drawUserLocationCircleDisaster(initialCenter);
        searchPlacesDisaster(initialCenter, 5000);
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
        if (place.geometry.viewport) { mapDisaster.fitBounds(place.geometry.viewport); } else { mapDisaster.setCenter(place.geometry.location); mapDisaster.setZoom(15); }
        
        if (currentDisasterFilter !== 'volcano') {
            clearDisasterMarkers();
            allDisasterPlaces = [];
            processedDisasterPlaceIds.clear();
            searchPlacesDisaster(place.geometry.location, 5000);
        }
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
        if (currentDisasterFilter === 'volcano') return;
        const zoomLevel = mapDisaster.getZoom();
        if (zoomLevel >= 12) {
            const newCenter = mapDisaster.getCenter();
            searchPlacesDisaster(newCenter, 5000);
        }
    });

    const startInputDisaster = document.getElementById('startDisaster');
    const endInputDisaster = document.getElementById('endDisaster');
    new Autocomplete(startInputDisaster, { types: ['geocode', 'establishment'] }).bindTo('bounds', mapDisaster);
    new Autocomplete(endInputDisaster, { types: ['geocode', 'establishment'] }).bindTo('bounds', mapDisaster);
}

// GeoJSONデータをGoogle Maps Polygonオブジェクトに変換する処理
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
    // GeoJSONの座標は [lng, lat] なので {lat, lng} に変換
    // Polygonの場合、coordinates[0] が外周
    const path = coordinates[0].map(coord => ({ lat: coord[1], lng: coord[0] }));
    const polygon = new google.maps.Polygon({ paths: path });
    exclusionPolygons.push(polygon);
}

let processedDisasterPlaceIds = new Set();
let currentDisasterFilter = 'all';

function searchPlacesDisaster(center, radius) {
    if (!disasterPlacesService) return;
    
    // ホテル等は除外し、基本的な避難所のみ検索
    const request = {
        location: center,
        radius: radius,
        keyword: "school OR community center OR park OR gym OR hospital" 
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
}

function shouldDisplayPlace(place, filterType) {
    if (!place.geometry || !place.geometry.location) return false;
    const placeTypes = place.types || [];
    
    const isShelterCandidate = placeTypes.includes('school') || 
                               placeTypes.includes('community_center') || 
                               placeTypes.includes('local_government_office') ||
                               placeTypes.includes('gym') ||
                               placeTypes.includes('church');
    const isHospital = placeTypes.includes('hospital');

    if (filterType === 'tsunami') {
         // 1. 公園などは除外
         if (placeTypes.includes('park') || placeTypes.includes('campground') || placeTypes.includes('rv_park')) {
            return false;
        }

        // 2. ハザードマップ（危険区域）内にあるか判定して除外
        // exclusionPolygons配列（GeoJSONから作成）を走査
        // ※データ量によっては重くなる可能性があります
        if (exclusionPolygons.length > 0) {
            for (let i = 0; i < exclusionPolygons.length; i++) {
                if (google.maps.geometry.poly.containsLocation(place.geometry.location, exclusionPolygons[i])) {
                    // ポリゴン内に含まれる＝危険区域内なので表示しない
                    return false;
                }
            }
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
    
    const alertMsg = document.getElementById('alertMsg');
    const legendHazard = document.getElementById('legendHazard');

    if (filterType === 'tsunami') {
        // ハザードマップ表示（赤色）
        mapDisaster.data.setStyle({
            visible: true,
            fillColor: '#FF0000',
            fillOpacity: 0.3,
            strokeColor: '#FF0000',
            strokeWeight: 1,
            clickable: false
        });
        
        if (alertMsg) alertMsg.textContent = "津波避難モード: 浸水想定区域（赤色）以外の避難所を表示しています。";
        if (legendHazard) legendHazard.style.display = 'list-item';

        // 再描画（shouldDisplayPlace内で除外判定が行われる）
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
        if (legendHazard) legendHazard.style.display = 'none';
        mapDisaster.setCenter({ lat: 19.65, lng: -155.5 });
        mapDisaster.setZoom(9);
        VOLCANO_SHELTER_DATA.forEach(data => createManualMarker(data));
    } 
    else {
        mapDisaster.data.setStyle({ visible: false });
        if (alertMsg) alertMsg.textContent = "現在、防災モードが有効です。避難情報と災害警報にご注意ください。";
        if (legendHazard) legendHazard.style.display = 'none';
        if (allDisasterPlaces.length === 0) {
            searchPlacesDisaster(mapDisaster.getCenter(), 5000);
        } else {
            allDisasterPlaces.forEach(place => {
                if (shouldDisplayPlace(place, filterType)) createDisasterMarker(place);
            });
        }
    }
}

async function createManualMarker(data) {
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
    const pin = new PinElement({
        background: '#28a745', 
        borderColor: '#155724',
        glyph: "避",
        glyphColor: "white",
        scale: 1.1
    });
    const marker = new AdvancedMarkerElement({ 
        map: mapDisaster, 
        position: { lat: data.lat, lng: data.lng }, 
        title: data.name, 
        content: pin.element
    });
    disasterMarkers.push(marker);
    marker.addListener('click', () => {
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.name)}`;
        const infoContent = `<div style="font-family: sans-serif; font-size: 14px; line-height: 1.5;"><h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${data.name}</h3><p style="margin: 0 0 8px 0; color: #555;"><strong>種別:</strong> 指定避難所 (火山対応)</p><button onclick="document.getElementById('endDisaster').value = '${data.name}'" style="padding: 6px 10px; cursor: pointer; margin-right:5px;">目的地に設定</button><a href="${mapsUrl}" target="_blank" style="color: #1a73e8;">Google マップで見る</a></div>`;
        disasterInfoWindow.setContent(infoContent);
        disasterInfoWindow.open(mapDisaster, marker);
    });
}

async function createDisasterMarker(place) {
    if (!place.geometry || !place.geometry.location) return;
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
    
    let bgColor, borderColor, glyphContent, categoryName;
    if (place.types.includes('hospital')) {
        bgColor = '#007bff'; borderColor = '#004085'; glyphContent = "＋"; categoryName = '病院';
    } else {
        bgColor = '#28a745'; borderColor = '#155724'; glyphContent = "避"; categoryName = '避難所';
    }

    const pin = new PinElement({
        background: bgColor, borderColor: borderColor, glyph: glyphContent, glyphColor: "white", scale: 1.1
    });

    const marker = new AdvancedMarkerElement({ 
        map: mapDisaster, position: place.geometry.location, title: place.name, content: pin.element
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
