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

// ハワイ島（ビッグアイランド）の火山避難所指定リスト
const BIG_ISLAND_VOLCANO_SHELTERS = [
    "Pahoa Community Center",
    "Keaau High School",
    "Keaau Armory",
    "Hilo High School",
    "Waiakea High School",
    "Kailua Park",
    "Kealakehe High School"
];

// フィルタタイプとボタンIDの対応表
const filterButtonIds = {
    'fire': 'filterFireShelters',
    'tsunami': 'filterTsunamiShelters',
    'volcano': 'filterVolcanoShelters',
    'hurricane': 'filterHurricaneShelters',
    'all': 'filterAllDisasters',
    'hideAll': 'filterHideAllDisasters'
};

// ボタンのスタイルを更新する関数
function updateFilterButtonStyles(activeType) {
    // 全てのボタンから active-filter クラスを削除
    Object.values(filterButtonIds).forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.classList.remove('active-filter');
        }
    });

    // 選択されたボタンに active-filter クラスを追加
    const activeId = filterButtonIds[activeType];
    if (activeId) {
        const activeBtn = document.getElementById(activeId);
        if (activeBtn) {
            activeBtn.classList.add('active-filter');
        }
    }
}

async function initMapDisaster() {
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
    const { PlacesService, Autocomplete } = await google.maps.importLibrary("places");
    const { DirectionsService, DirectionsRenderer } = await google.maps.importLibrary("routes");
    const { Geocoder } = await google.maps.importLibrary("geocoding");
    
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
    
    disasterPlacesService = new PlacesService(mapDisaster);
    disasterInfoWindow = new google.maps.InfoWindow({ maxWidth: 280 });
    mapDisaster.addListener('click', () => disasterInfoWindow.close());
    
    disasterDirectionsService = new DirectionsService();
    disasterDirectionsRenderer = new DirectionsRenderer({ map: mapDisaster, panel: document.getElementById('directionsPanelDisaster') });
    disasterGeocoder = new Geocoder();

    // 初期表示時は「全て表示」ボタンを選択状態にする
    updateFilterButtonStyles('all');

    function drawUserLocationCircleDisaster(center) {
        if (userLocationCircleDisaster) {
            userLocationCircleDisaster.setMap(null);
        }
        userLocationCircleDisaster = new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            map: mapDisaster,
            center: center,
            radius: 50
        });
    }
    
    const shelterTypes = ['community_center', 'school', 'fire_station', 'hospital'];
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
                userCurrentLocationDisaster = pos;
                mapDisaster.setCenter(pos); mapDisaster.setZoom(14);
                drawUserLocationCircleDisaster(pos);
                searchPlacesDisaster(pos, 2000, shelterTypes);
            },
            async (error) => {
                const initialCenter = mapDisaster.getCenter();
                userCurrentLocationDisaster = initialCenter;
                drawUserLocationCircleDisaster(initialCenter);
                searchPlacesDisaster(initialCenter, 2000, shelterTypes);
            }
        );
    } else {
        const initialCenter = mapDisaster.getCenter();
        userCurrentLocationDisaster = initialCenter;
        drawUserLocationCircleDisaster(initialCenter);
        searchPlacesDisaster(initialCenter, 2000, shelterTypes);
    }
    
    const searchInput = document.createElement('input');
    searchInput.id = 'mapSearchInput';
    searchInput.placeholder = '避難所を検索';
    searchInput.style.cssText = 'width: calc(100% - 20px); padding: 10px; margin: 10px; border: 1px solid #ccc; border-radius: 8px; font-size: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);';
    mapDisaster.controls[google.maps.ControlPosition.TOP_CENTER].push(searchInput);
    
    const autocomplete = new Autocomplete(searchInput, { types: ['geocode', 'establishment'] });
    autocomplete.bindTo("bounds", mapDisaster);
    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) { return; }
        if (place.geometry.viewport) { mapDisaster.fitBounds(place.geometry.viewport); } else { mapDisaster.setCenter(place.geometry.location); mapDisaster.setZoom(17); }
        clearDisasterMarkers();
        allDisasterPlaces = [];
        processedDisasterPlaceIds.clear();
        searchPlacesDisaster(place.geometry.location, 2000, shelterTypes);
    });
    
    const returnButton = document.createElement('button');
    returnButton.id = 'returnToCurrentLocationDisaster';
    returnButton.textContent = '現在地に戻る';
    returnButton.className = 'map-control-button';
    returnButton.addEventListener('click', async () => {
        if (userCurrentLocationDisaster) {
            mapDisaster.setCenter(userCurrentLocationDisaster); mapDisaster.setZoom(14);
            clearDisasterMarkers();
            allDisasterPlaces = [];
            processedDisasterPlaceIds.clear();
            searchPlacesDisaster(userCurrentLocationDisaster, 2000, shelterTypes);
            drawUserLocationCircleDisaster(userCurrentLocationDisaster);
            // 現在地に戻ったときはフィルタを「全て」にリセットするのも良いが、
            // ここでは現在のフィルタ状態を維持するか、必要なら updateFilterButtonStyles('all') を呼ぶ
        } else { console.warn('現在地が取得できませんでした。'); }
    });
    mapDisaster.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(returnButton);
    
    mapDisaster.addListener('idle', () => {
        const zoomLevel = mapDisaster.getZoom();
        if (zoomLevel >= 12) {
            const newCenter = mapDisaster.getCenter();
            searchPlacesDisaster(newCenter, 2000, shelterTypes);
        }
    });

    const startInputDisaster = document.getElementById('startDisaster');
    const endInputDisaster = document.getElementById('endDisaster');
    new Autocomplete(startInputDisaster, { types: ['geocode', 'establishment'] }).bindTo('bounds', mapDisaster);
    new Autocomplete(endInputDisaster, { types: ['geocode', 'establishment'] }).bindTo('bounds', mapDisaster);
}

let processedDisasterPlaceIds = new Set();
let currentDisasterFilter = 'all';

function searchPlacesDisaster(center, radius, types) {
    if (!disasterPlacesService) return;
    types.forEach(type => {
        const request = { location: center, radius: radius, type: type };
        disasterPlacesService.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                const filteredResults = results.filter(place => types.some(t => place.types.includes(t)));
                for (const place of filteredResults) {
                    if (place.place_id && !processedDisasterPlaceIds.has(place.place_id)) {
                        processedDisasterPlaceIds.add(place.place_id);
                        getPlaceDetailsDisaster(place.place_id);
                    }
                }
            }
        });
    });
}

function getPlaceDetailsDisaster(placeId) {
    const request = { placeId, fields: ['name', 'geometry', 'types', 'rating', 'user_ratings_total', 'place_id', 'icon', 'formatted_address'] };
    disasterPlacesService.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            allDisasterPlaces.push(place);
            if (shouldDisplayPlace(place, currentDisasterFilter)) {
                createDisasterMarker(place);
            }
        }
    });
}

function shouldDisplayPlace(place, filterType) {
    if (!place.geometry || !place.geometry.location) return false;
    
    const placeLat = place.geometry.location.lat();
    const placeLng = place.geometry.location.lng();
    
    const coastPoint = new google.maps.LatLng(21.27, placeLng);
    const distanceToCoast = google.maps.geometry.spherical.computeDistanceBetween(place.geometry.location, coastPoint); 
    const distKm = distanceToCoast / 1000;

    const placeTypes = place.types || [];

    switch (filterType) {
        case 'fire':
            return (placeTypes.includes('fire_station') || placeTypes.includes('school') || placeTypes.includes('community_center')) 
                   && distKm <= 10;
        
        case 'tsunami':
            return (placeTypes.includes('community_center') || placeTypes.includes('school')) 
                   && distKm > 10;
        
        case 'volcano':
            // ハワイ島（ビッグアイランド）の判定
            const isBigIsland = (placeLat >= 18.9 && placeLat <= 20.35 && placeLng >= -156.1 && placeLng <= -154.8);

            if (isBigIsland) {
                const name = place.name || "";
                return BIG_ISLAND_VOLCANO_SHELTERS.some(shelterName => name.includes(shelterName));
            } else {
                return placeTypes.includes('community_center') || placeTypes.includes('school');
            }
        
        case 'hurricane':
            return (placeTypes.includes('community_center') || placeTypes.includes('school') || placeTypes.includes('hospital'))
                   && distKm > 5;
        
        case 'all':
            return placeTypes.includes('community_center') || placeTypes.includes('school') || placeTypes.includes('fire_station') || placeTypes.includes('hospital');
        
        case 'hideAll':
            return false;
        
        default:
            return true;
    }
}

async function createDisasterMarker(place) {
    if (!place.geometry || !place.geometry.location) return;
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
    
    let categoryName = '避難所';
    let bgColor = '#28a745'; 
    let glyphContent = "避"; 

    if (place.types.includes('hospital')) {
        bgColor = '#007bff'; 
        categoryName = '病院';
        glyphContent = "＋"; 
    }

    const pin = new PinElement({
        background: bgColor,
        borderColor: "#ffffff",
        glyph: glyphContent,
        glyphColor: "white",
        scale: 1.1
    });

    const marker = new AdvancedMarkerElement({ 
        map: mapDisaster, 
        position: place.geometry.location, 
        title: place.name, 
        content: pin.element
    });
    
    marker.placeAddress = place.formatted_address;
    marker.placeTypes = place.types;
    disasterMarkers.push(marker);
    
    marker.addListener('click', () => {
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`;
        const encodedAddress = encodeURIComponent(place.formatted_address || place.name).replace(/'/g, "\\'");

        const infoContent = `<div style="font-family: sans-serif; font-size: 14px; line-height: 1.5;"><h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">${place.name}</h3><p style="margin: 0 0 8px 0; color: #555;"><strong>カテゴリ:</strong> ${categoryName}</p><button onclick="document.getElementById('startDisaster').value = decodeURIComponent('${encodedAddress}');" style="margin-right: 8px; padding: 6px 10px; font-size: 13px; cursor: pointer;">ここを出発地にする</button><button onclick="document.getElementById('endDisaster').value = decodeURIComponent('${encodedAddress}');" style="padding: 6px 10px; font-size: 13px; cursor: pointer;">ここを目的地にする</button><a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" style="color: #1a73e8; text-decoration: none; font-weight: 500; display: block; margin-top: 12px;">Google マップで詳細を見る</a></div>`;
        disasterInfoWindow.setContent(infoContent);
        disasterInfoWindow.open(mapDisaster, marker);
    });
}

function clearDisasterMarkers() {
    for (const marker of disasterMarkers) marker.map = null;
    disasterMarkers = [];
    if (disasterInfoWindow) disasterInfoWindow.close();
}

function filterDisasterMarkers(selectedTypes, filterType) {
    clearDisasterMarkers();
    currentDisasterFilter = filterType;
    
    // ボタンのスタイルを更新
    updateFilterButtonStyles(filterType);

    for (const place of allDisasterPlaces) {
        if (shouldDisplayPlace(place, filterType)) {
            createDisasterMarker(place);
        }
    }
    if(typeof updateDisasterInfo === 'function') {
        updateDisasterInfo(filterType);
    }
}

function calcRouteDisaster() {
    const start = document.getElementById('startDisaster').value;
    const end = document.getElementById('endDisaster').value;
    const travelMode = document.getElementById('travelModeDisaster').value;

    if (!start || !end) {
        alert('出発地と目的地を入力してください。');
        return;
    }

    const request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode[travelMode]
    };

    disasterDirectionsService.route(request, (result, status) => {
        if (status === 'OK') {
            disasterDirectionsRenderer.setDirections(result);
            document.getElementById('googleMapsNaviButtonDisaster').style.display = 'inline-block';
        } else {
            console.error('Directions request failed:', status, result);
            alert('経路が見つかりませんでした: ' + status);
        }
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

    if (!end) {
        alert("目的地が設定されていません。");
        return;
    }
    
    let url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(end)}&travelmode=${travelMode}`;
    
    if (start) {
        url += `&origin=${encodeURIComponent(start)}`;
    }

    window.open(url, '_blank');
}

function getCurrentLocationForDirectionsDisaster(inputId) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            disasterGeocoder.geocode({ 'location': pos }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    document.getElementById(inputId).value = results[0].formatted_address;
                } else {
                    document.getElementById(inputId).value = `${pos.lat}, ${pos.lng}`;
                }
            });
        }, (error) => {
            console.warn("現在地を取得できませんでした。");
        });
    } else {
        console.warn("お使いのブラウザはGeolocationをサポートしていません。");
    }
}
