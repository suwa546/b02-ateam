/* map_tourJ.js */

let mapTour;
let tourMarkers = [];
let allTourPlaces = [];
let tourPlacesService;
let userCurrentLocationTour = null;
let userLocationCircleTour;
let tourInfoWindow;
let tourDirectionsService;
let tourDirectionsRenderer;
let tourGeocoder;

// HIS関連施設データ
const hisSpecialPlaces = [
    {
        name: "HIS LeaLeaラウンジ (ロイヤルハワイアンセンター)",
        location: { lat: 21.279346, lng: -157.829442 },
        type: "HIS_STORE",
        desc: "HISの現地サポートデスク。オプショナルツアー予約など。"
    },
    {
        name: "HIS Hawaii アラモアナ支店",
        location: { lat: 21.291079, lng: -157.842790 },
        type: "HIS_STORE",
        desc: "アラモアナセンター内のHIS店舗。"
    },
    {
        name: "ウルフギャング・ステーキハウス (提携店)",
        location: { lat: 21.2798, lng: -157.8292 },
        type: "HIS_PARTNER",
        desc: "【HIS提携】極上の熟成肉ステーキを楽しめる名店。"
    },
    {
        name: "ヒルトン・ハワイアン・ビレッジ (提携ホテル)",
        location: { lat: 21.2846, lng: -157.8378 },
        type: "HIS_PARTNER",
        desc: "【HIS提携】ワイキキ最大級のリゾートホテル。"
    }
];

async function initMapTour() {
    const { Map } = await google.maps.importLibrary("maps");
    const { PlacesService, Autocomplete } = await google.maps.importLibrary("places");
    const { DirectionsService, DirectionsRenderer } = await google.maps.importLibrary("routes");
    const { Geocoder } = await google.maps.importLibrary("geocoding");

    const initialLat = 21.3069;
    const initialLon = -157.8583;
    const initialZoom = 13;

    mapTour = new Map(document.getElementById('map'), {
        center: { lat: initialLat, lng: initialLon },
        zoom: initialZoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        mapId: "40ca9d23eb95bcf78932c38e", // ベクターマップID
        gestureHandling: 'greedy',
        clickableIcons: false,
    });

    tourPlacesService = new PlacesService(mapTour);
    tourInfoWindow = new google.maps.InfoWindow({ maxWidth: 280 });
    mapTour.addListener('click', () => tourInfoWindow.close());

    tourDirectionsService = new DirectionsService();
    tourDirectionsRenderer = new DirectionsRenderer({ map: mapTour, panel: document.getElementById('directionsPanelTour') });
    tourGeocoder = new Geocoder();

    function drawUserLocationCircle(center) {
        if (userLocationCircleTour) {
            userLocationCircleTour.setMap(null);
        }
        userLocationCircleTour = new google.maps.Circle({
            strokeColor: '#4285F4',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#4285F4',
            fillOpacity: 0.35,
            map: mapTour,
            center: center,
            radius: 50
        });
    }
    
    const searchTypes = ['restaurant', 'cafe', 'tourist_attraction', 'lodging', 'store', 'point_of_interest'];
    
    addHisSpecialMarkers();

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
                userCurrentLocationTour = pos;
                mapTour.setCenter(pos); mapTour.setZoom(14);
                drawUserLocationCircle(pos);
                searchPlacesTour(pos, 2000, searchTypes);
            },
            async (error) => {
                console.error("Geolocation failed:", error);
                const initialCenter = mapTour.getCenter();
                userCurrentLocationTour = initialCenter;
                drawUserLocationCircle(initialCenter);
                searchPlacesTour(initialCenter, 2000, searchTypes);
            }
        );
    } else {
        const initialCenter = mapTour.getCenter();
        userCurrentLocationTour = initialCenter;
        drawUserLocationCircle(initialCenter);
        searchPlacesTour(initialCenter, 2000, searchTypes);
    }
    
    const searchInput = document.createElement('input');
    searchInput.id = 'mapSearchInput';
    searchInput.placeholder = '場所を検索';
    searchInput.style.cssText = 'width: calc(100% - 20px); padding: 10px; margin: 10px; border: 1px solid #ccc; border-radius: 8px; font-size: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);';
    mapTour.controls[google.maps.ControlPosition.TOP_CENTER].push(searchInput);
    
    const autocomplete = new Autocomplete(searchInput, { types: ['geocode', 'establishment'] });
    autocomplete.bindTo("bounds", mapTour);
    autocomplete.addListener('place_changed', async () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) { return; }
        if (place.geometry.viewport) { mapTour.fitBounds(place.geometry.viewport); } else { mapTour.setCenter(place.geometry.location); mapTour.setZoom(17); }
        
        clearTourMarkers();
        allTourPlaces = [];
        processedPlaceIds.clear();
        
        addHisSpecialMarkers();
        searchPlacesTour(place.geometry.location, 2000, searchTypes);
    });

    const returnButton = document.createElement('button');
    returnButton.id = 'returnToCurrentLocationTour';
    returnButton.textContent = '現在地に戻る';
    returnButton.className = 'map-control-button';
    returnButton.addEventListener('click', async () => {
        if (userCurrentLocationTour) {
            mapTour.setCenter(userCurrentLocationTour); mapTour.setZoom(14);
            clearTourMarkers();
            allTourPlaces = [];
            processedPlaceIds.clear();
            addHisSpecialMarkers();
            searchPlacesTour(userCurrentLocationTour, 2000, searchTypes);
            drawUserLocationCircle(userCurrentLocationTour);
        } else { console.warn('現在地が取得できませんでした。'); }
    });
    mapTour.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(returnButton);

    mapTour.addListener('idle', () => {
        const zoomLevel = mapTour.getZoom();
        if (zoomLevel >= 12) {
            const newCenter = mapTour.getCenter();
            searchPlacesTour(newCenter, 2000, searchTypes);
        }
    });

    const startInputTour = document.getElementById('startTour');
    const endInputTour = document.getElementById('endTour');
    new Autocomplete(startInputTour, { types: ['geocode', 'establishment'] }).bindTo('bounds', mapTour);
    new Autocomplete(endInputTour, { types: ['geocode', 'establishment'] }).bindTo('bounds', mapTour);
}

// HIS関連マーカーを表示（目立つように変更）
async function addHisSpecialMarkers() {
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
    
    hisSpecialPlaces.forEach(hisPlace => {
        // HIS用の非常に目立つピンを作成
        const pin = new PinElement({
            background: "#0055aa", // HISブルー
            borderColor: "#ffcc00", // 黄色の枠線で強調
            glyph: "HIS", // テキストを表示
            glyphColor: "white",
            scale: 1.5 // サイズを大きく
        });

        const marker = new AdvancedMarkerElement({
            map: mapTour,
            position: hisPlace.location,
            title: hisPlace.name,
            content: pin.element
        });

        marker.placeTypes = ["HIS"];
        // マーカーを常に最前面に
        marker.zIndex = 9999;

        const infoContent = `
            <div style="font-family: sans-serif; padding: 5px;">
                <h3 style="color: #0055aa; margin: 0 0 5px 0;">${hisPlace.name}</h3>
                <p style="margin: 5px 0; font-weight:bold; color: #e4001b;">${hisPlace.type === 'HIS_STORE' ? 'HIS店舗' : 'HIS提携店'}</p>
                <p style="font-size: 13px;">${hisPlace.desc}</p>
                <button onclick="document.getElementById('endTour').value = '${hisPlace.name}'" style="margin-top:5px; padding: 5px 10px; background:#0055aa; color:white; border:none; border-radius:4px; cursor:pointer;">ここへ行く</button>
            </div>
        `;

        marker.addListener('click', () => {
            tourInfoWindow.setContent(infoContent);
            tourInfoWindow.open(mapTour, marker);
        });

        tourMarkers.push(marker);
    });
}

let processedPlaceIds = new Set();

function searchPlacesTour(center, radius, types) {
    if (!tourPlacesService) return;
    types.forEach(type => {
        const request = { location: center, radius: radius, type: type };
        tourPlacesService.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                for (const place of results) {
                    if (place.place_id && !processedPlaceIds.has(place.place_id)) {
                        processedPlaceIds.add(place.place_id);
                        getPlaceDetailsTour(place.place_id);
                    }
                }
            }
        });
    });
}

function getPlaceDetailsTour(placeId) {
    const request = { placeId, fields: ['name', 'geometry', 'types', 'rating', 'user_ratings_total', 'place_id', 'icon', 'formatted_address'] };
    tourPlacesService.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            allTourPlaces.push(place);
            createTourMarker(place);
        }
    });
}

async function createTourMarker(place) {
    if (!place.geometry || !place.geometry.location) return;
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    
    const icon = document.createElement('img');
    icon.src = place.icon;
    icon.style.width = '25px';
    icon.style.height = '25px';
    
    let categoryName = 'その他';
    if (place.types.includes('tourist_attraction')) { categoryName = '観光名所'; } 
    else if (place.types.includes('cafe')) { categoryName = 'カフェ'; } 
    else if (place.types.includes('lodging')) { categoryName = '宿泊施設'; } 
    else if (place.types.includes('store')) { categoryName = 'ショッピング'; } 
    else if (place.types.includes('restaurant')) { categoryName = '飲食店'; }
    
    const marker = new AdvancedMarkerElement({ 
        map: mapTour, 
        position: place.geometry.location, 
        title: place.name, 
        content: icon 
    });
    
    marker.placeTypes = place.types;
    marker.placeRating = place.rating || 0;
    marker.placeAddress = place.formatted_address;

    tourMarkers.push(marker);

    marker.addListener('click', () => {
        let ratingHtml = '<span style="color: #777;">評価はありません</span>';
        if (place.rating && place.user_ratings_total > 0) {
            const fullStars = Math.round(place.rating);
            const emptyStars = 5 - fullStars;
            const stars = '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
            ratingHtml = `<span style="color: #f5a623; font-weight: bold; vertical-align: middle;">${place.rating.toFixed(1)}</span> <span style="vertical-align: middle;">${stars}</span> <span style="font-size: 12px; color: #555;">(${place.user_ratings_total}件)</span>`;
        }
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`;
        const encodedAddress = encodeURIComponent(place.formatted_address || place.name).replace(/'/g, "\\'");
        
        const infoContent = `<div style="font-family: sans-serif; font-size: 14px; line-height: 1.5;"><h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">${place.name}</h3><p style="margin: 0 0 8px 0; color: #555;"><strong>カテゴリ:</strong> ${categoryName}</p><div style="margin: 0 0 12px 0;">${ratingHtml}</div><button onclick="document.getElementById('startTour').value = decodeURIComponent('${encodedAddress}');" style="margin-right: 8px; padding: 6px 10px; font-size: 13px; cursor: pointer;">ここを出発地にする</button><button onclick="document.getElementById('endTour').value = decodeURIComponent('${encodedAddress}');" style="padding: 6px 10px; font-size: 13px; cursor: pointer;">ここを目的地にする</button><a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" style="color: #1a73e8; text-decoration: none; font-weight: 500; display: block; margin-top: 12px;">Google マップで詳細を見る</a></div>`;
        tourInfoWindow.setContent(infoContent);
        tourInfoWindow.open(mapTour, marker);
    });
}

function clearTourMarkers() {
    for (let i = tourMarkers.length - 1; i >= 0; i--) {
        if (!tourMarkers[i].placeTypes || !tourMarkers[i].placeTypes.includes("HIS")) {
            tourMarkers[i].setMap(null);
            tourMarkers.splice(i, 1);
        }
    }
    if (tourInfoWindow) tourInfoWindow.close();
}

function filterTourMarkers(selectedTypes) {
    clearTourMarkers();
    for (const place of allTourPlaces) {
        const matchesType = selectedTypes.length === 0 || place.types.some(type => selectedTypes.includes(type));
        if (matchesType) {
            createTourMarker(place);
        }
    }
}

function filterByRatingTour(minRating, maxRating) {
    clearTourMarkers();
    for (const place of allTourPlaces) {
        const isFoodOrCafe = place.types.includes('restaurant') || place.types.includes('cafe');
        
        // 数値としての評価が存在するか厳密にチェック
        const hasRating = typeof place.rating === 'number' && !isNaN(place.rating);
        
        if (isFoodOrCafe) {
            // "全ての評価" モード (-1, -1) の場合は、評価有無に関わらず全て表示
            if (minRating === -1 && maxRating === -1) {
                createTourMarker(place);
            }
            // 特定の評価範囲を指定された場合
            else if (hasRating) {
                if (place.rating >= minRating && place.rating < maxRating) {
                    createTourMarker(place);
                }
            }
            // 評価なし(hasRating=false)は、指定範囲検索モードでは表示しない
        }
    }
}

function calcRouteTour() {
    const start = document.getElementById('startTour').value;
    const end = document.getElementById('endTour').value;
    const travelMode = document.getElementById('travelModeTour').value;

    if (!start || !end) {
        alert('出発地と目的地を入力してください。');
        return;
    }

    const request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode[travelMode]
    };

    tourDirectionsService.route(request, (result, status) => {
        if (status === 'OK') {
            tourDirectionsRenderer.setDirections(result);
            // 音声案内（Googleマップ連携）ボタンを表示
            document.getElementById('googleMapsNaviButtonTour').style.display = 'inline-block';
        } else {
            console.error('Directions request failed:', status, result);
            alert('経路が見つかりませんでした: ' + status);
        }
    });
}

function clearDirectionsTour() {
    tourDirectionsRenderer.setDirections({ routes: [] });
    document.getElementById('directionsPanelTour').innerHTML = '';
    document.getElementById('startTour').value = '';
    document.getElementById('endTour').value = '';
    document.getElementById('googleMapsNaviButtonTour').style.display = 'none';
}

// Googleマップでナビを開始する関数
function openGoogleMapsNaviTour() {
    const start = document.getElementById('startTour').value;
    const end = document.getElementById('endTour').value;
    const travelMode = document.getElementById('travelModeTour').value.toLowerCase();

    if (!end) {
        alert("目的地が設定されていません。");
        return;
    }

    // Google Maps URL Schemeを使用
    // api=1
    // destination: 目的地
    // origin: 出発地（指定がなければ現在地になるが、入力されていれば使う）
    // travelmode: driving, walking, bicycling, transit
    
    let url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(end)}&travelmode=${travelMode}`;
    
    if (start) {
        url += `&origin=${encodeURIComponent(start)}`;
    }

    window.open(url, '_blank');
}

function getCurrentLocationForDirectionsTour(inputId) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            tourGeocoder.geocode({ 'location': pos }, (results, status) => {
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