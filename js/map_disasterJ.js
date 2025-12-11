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
let tsunamiLayer = null; // 津波ハザードマップ用レイヤー

// ハワイ島（ビッグアイランド）の火山避難所指定リスト
// ArcGISマップ(ハワイ郡公式)に基づく主要避難所
const BIG_ISLAND_VOLCANO_SHELTERS = [
    "Pahoa Community Center",
    "Pahoa Neighborhood Facility",
    "Keaau High School",
    "Keaau Armory",
    "Herbert Shipman Park",
    "Hilo High School",
    "Waiakea High School",
    "Kailua Park",     // Old Kona Airport State Recreation Area
    "Kailua District Park",
    "Kealakehe High School",
    "Robert Herkes Gymnasium",
    "Ka'u District Gym",
    "Pahala Community Center",
    "Naalehu Community Center",
    "Mountain View Elementary School",
    "Honokaa High School",
    "Pahoa High School",
    "Sure Foundation Church" // 過去の噴火時によく使用された場所
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
    
    // 初期表示位置（ホノルル周辺）
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
    
    // --- 津波ハザードマップレイヤーの初期化 ---
    // NOAAやハワイ州が提供するKMLデータを使用します。
    // 注意: KMLを表示するには、そのURLがGoogleのサーバーからアクセス可能な公開URLである必要があります。
    // 以下のURLはPacIOOS (Pacific Islands Ocean Observing System) が提供するハワイ全土の津波避難ゾーンです。
    tsunamiLayer = new google.maps.KmlLayer({
        url: "http://geo.pacioos.hawaii.edu/geoserver/wms/kml?layers=PACIOOS:hi_state_all_tsunami_evac_zones&mode=download",
        suppressInfoWindows: false, // ゾーンをクリックしたときに情報を表示するか
        preserveViewport: true,     // レイヤー表示時に勝手にズームしない
        map: null,                  // 初期状態は非表示
        zIndex: 0
    });

    // KMLのロードエラー処理
    google.maps.event.addListener(tsunamiLayer, 'status_changed', function () {
        if (tsunamiLayer.getStatus() !== 'OK') {
            console.warn('津波ハザードマップKMLの読み込みに失敗しました。Status:', tsunamiLayer.getStatus());
            // 代替案: ローカルでホストしたKMLがある場合はそちらを指定してください
        }
    });
    // ----------------------------------------

    disasterPlacesService = new PlacesService(mapDisaster);
    disasterInfoWindow = new google.maps.InfoWindow({ maxWidth: 280 });
    mapDisaster.addListener('click', () => disasterInfoWindow.close());
    
    disasterDirectionsService = new DirectionsService();
    disasterDirectionsRenderer = new DirectionsRenderer({ map: mapDisaster, panel: document.getElementById('directionsPanelDisaster') });
    disasterGeocoder = new Geocoder();

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
    
    const shelterTypes = ['community_center', 'school', 'fire_station', 'hospital', 'park', 'gym', 'local_government_office', 'church'];
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
                userCurrentLocationDisaster = pos;
                mapDisaster.setCenter(pos); mapDisaster.setZoom(14);
                drawUserLocationCircleDisaster(pos);
                searchPlacesDisaster(pos, 5000, shelterTypes); // 検索範囲を少し広げました
            },
            async (error) => {
                const initialCenter = mapDisaster.getCenter();
                userCurrentLocationDisaster = initialCenter;
                drawUserLocationCircleDisaster(initialCenter);
                searchPlacesDisaster(initialCenter, 5000, shelterTypes);
            }
        );
    } else {
        const initialCenter = mapDisaster.getCenter();
        userCurrentLocationDisaster = initialCenter;
        drawUserLocationCircleDisaster(initialCenter);
        searchPlacesDisaster(initialCenter, 5000, shelterTypes);
    }
    
    // 検索ボックス
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
        
        clearDisasterMarkers();
        allDisasterPlaces = [];
        processedDisasterPlaceIds.clear();
        // 移動先で再検索
        searchPlacesDisaster(place.geometry.location, 5000, shelterTypes);
    });
    
    // 現在地ボタン
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
            searchPlacesDisaster(userCurrentLocationDisaster, 5000, shelterTypes);
            drawUserLocationCircleDisaster(userCurrentLocationDisaster);
        } else { console.warn('現在地が取得できませんでした。'); }
    });
    mapDisaster.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(returnButton);
    
    // アイドル時に追加検索（スクロール時など）
    mapDisaster.addListener('idle', () => {
        const zoomLevel = mapDisaster.getZoom();
        if (zoomLevel >= 12) {
            const newCenter = mapDisaster.getCenter();
            // 既にロード済みの範囲ならスキップするロジックを入れると良いが、簡易的に追加検索
            searchPlacesDisaster(newCenter, 5000, shelterTypes);
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
    
    // typeごとに検索するとAPIコールが増えるので、主要なものに絞るか、keyword検索を併用
    // ここではキーワード検索で一括取得を試みる（学校、コミュニティセンター、公園）
    const request = {
        location: center,
        radius: radius,
        // type指定ではなくkeywordで広めに拾う（"shelter"だと出ない場所が多いため施設名で拾う）
        keyword: "school OR community center OR park OR gym OR hospital" 
    };
    
    disasterPlacesService.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            for (const place of results) {
                if (place.place_id && !processedDisasterPlaceIds.has(place.place_id)) {
                    processedDisasterPlaceIds.add(place.place_id);
                    // 取得したPlaceを保存
                    allDisasterPlaces.push(place); 
                    // 現在のフィルタに合わせて表示判定
                    if (shouldDisplayPlace(place, currentDisasterFilter)) {
                        createDisasterMarker(place);
                    }
                }
            }
        }
    });
}

// フィルタリングロジックの要
function shouldDisplayPlace(place, filterType) {
    if (!place.geometry || !place.geometry.location) return false;
    
    const placeLat = place.geometry.location.lat();
    const placeLng = place.geometry.location.lng();
    const placeName = place.name || "";
    const placeTypes = place.types || [];
    
    // 海岸からの距離計算（簡易的な判定）
    // 緯度21.27を基準線としているのは簡易版です。実際はGeometry Libraryで計算します。
    // ここでは、特定の座標（その場所）と「最も近い海岸線」の距離を正確に出すのはAPIなしでは難しいため、
    // ハワイ諸島の特性上、標高や「内陸かどうか」が重要ですが、簡易的に海岸線を想定したポイントとの距離を測るか、
    // あるいは「危険区域（KML）」の外にあるものをAPIなしで判定するのは困難です。
    // そのため、ここでは「津波」に関しては「海岸から1.5km以上離れている」かつ「学校・公共施設」を表示します。
    // ※ハワイの津波避難ゾーンは概ね沿岸1マイル(1.6km)以内が多いため。
    
    // 便宜上、各場所から「最寄りの海」までの距離を正確に知ることはできないため、
    // Google Maps Geometryライブラリを使っても「海ポリゴン」がないと判定不能。
    // 今回は「津波モード」のときは、KMLレイヤーで危険区域を可視化し、
    // 避難所ピンについては『明らかに海沿い（ビーチパーク等）』を除外するロジックにします。

    // Placeタイプによる基本フィルタ
    const isShelterCandidate = placeTypes.includes('school') || 
                               placeTypes.includes('community_center') || 
                               placeTypes.includes('local_government_office') ||
                               placeTypes.includes('gym') ||
                               placeTypes.includes('church'); // 教会も避難所になることが多い

    // ハワイ島判定
    const isBigIsland = (placeLat >= 18.9 && placeLat <= 20.35 && placeLng >= -156.1 && placeLng <= -154.8);

    switch (filterType) {
        case 'fire':
            // 火災: 消防署、学校、コミュニティセンター
            return placeTypes.includes('fire_station') || placeTypes.includes('school') || placeTypes.includes('community_center');
        
        case 'tsunami':
            // 津波: ハザードマップ（KML）外にある場所のみ表示したい。
            // クライアントサイドだけで「KMLポリゴンの外か」を判定するのは不可。
            // 代替案: 「海沿いの公園」などは除外。「学校」「高台の施設」を優先。
            // また、内陸にあると推定される場所を表示。
            // ここでは簡易的に「park」タイプを除外し、学校・公共施設に絞ることでリスクを減らす。
            // 本来は標高データが必要。
            if (placeTypes.includes('park') || placeTypes.includes('campground') || placeTypes.includes('rv_park')) {
                return false; // 海沿いの公園は避難所として不適切（津波時）
            }
            return isShelterCandidate;
        
        case 'volcano':
            // 火山: ハワイ島かつ、指定リストにある場所のみ
            if (isBigIsland) {
                // 名前リストと照合（部分一致）
                const isDesignated = BIG_ISLAND_VOLCANO_SHELTERS.some(shelterName => placeName.includes(shelterName));
                return isDesignated;
            } else {
                // 他の島では火山リスクは低いため表示しない、あるいは主要施設のみ
                return false; 
            }
        
        case 'hurricane':
            // ハリケーン: 頑丈な建物（学校、公共施設、病院）
            return isShelterCandidate || placeTypes.includes('hospital');
        
        case 'all':
            return isShelterCandidate || placeTypes.includes('fire_station') || placeTypes.includes('hospital');
        
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
    let bgColor = '#28a745'; // 緑
    let glyphContent = "避"; 

    if (place.types.includes('hospital')) {
        bgColor = '#007bff'; // 青
        categoryName = '病院';
        glyphContent = "＋"; 
    } else if (place.types.includes('fire_station')) {
        bgColor = '#dc3545'; // 赤
        categoryName = '消防署';
        glyphContent = "消";
    }

    const pin = new PinElement({
        background: bgColor,
        borderColor: "#ffffff",
        glyph: glyphContent,
        glyphColor: "white",
        scale: 1.0
    });

    const marker = new AdvancedMarkerElement({ 
        map: mapDisaster, 
        position: place.geometry.location, 
        title: place.name, 
        content: pin.element
    });
    
    marker.placeAddress = place.formatted_address || "";
    
    disasterMarkers.push(marker);
    
    marker.addListener('click', () => {
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`;
        const encodedAddress = encodeURIComponent(place.formatted_address || place.name).replace(/'/g, "\\'");

        const infoContent = `
            <div style="font-family: sans-serif; font-size: 14px; line-height: 1.5;">
                <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">${place.name}</h3>
                <p style="margin: 0 0 8px 0; color: #555;"><strong>カテゴリ:</strong> ${categoryName}</p>
                <p style="margin: 0 0 8px 0; font-size: 12px;">${place.formatted_address || ''}</p>
                <div style="display:flex; gap:5px; flex-wrap:wrap;">
                    <button onclick="document.getElementById('startDisaster').value = decodeURIComponent('${encodedAddress}');" style="padding: 6px 10px; cursor: pointer;">ここを出発地に</button>
                    <button onclick="document.getElementById('endDisaster').value = decodeURIComponent('${encodedAddress}');" style="padding: 6px 10px; cursor: pointer;">ここを目的地に</button>
                </div>
                <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" style="color: #1a73e8; text-decoration: none; font-weight: 500; display: block; margin-top: 10px;">Google マップで詳細を見る</a>
            </div>`;
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
    updateFilterButtonStyles(filterType);
    
    // --- 津波レイヤーの制御 ---
    if (filterType === 'tsunami' && tsunamiLayer) {
        tsunamiLayer.setMap(mapDisaster);
        // マップの情報を更新
        const alertMsg = document.getElementById('alertMsg');
        if (alertMsg) alertMsg.textContent = "津波避難モード: 赤や斜線のエリアは危険区域です。区域外の避難所へ移動してください。";
    } else {
        if (tsunamiLayer) tsunamiLayer.setMap(null);
        // メッセージを戻す
        const alertMsg = document.getElementById('alertMsg');
        if (alertMsg) alertMsg.textContent = "現在、防災モードが有効です。避難情報と災害警報にご注意ください。";
    }
    // -----------------------
    
    // 場所の再描画
    // allDisasterPlacesにデータがない場合は再検索を促すか、現在の範囲で検索
    if (allDisasterPlaces.length === 0) {
        searchPlacesDisaster(mapDisaster.getCenter(), 5000, ['school', 'community_center']);
    } else {
        for (const place of allDisasterPlaces) {
            if (shouldDisplayPlace(place, filterType)) {
                createDisasterMarker(place);
            }
        }
    }
}

// 経路検索等は変更なし
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
    }
}
