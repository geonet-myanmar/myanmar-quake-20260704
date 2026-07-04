// --- Earth Science Constants & Setup ---
const EPICENTER_LAT = 16.98;
const EPICENTER_LON = 96.01;

// --- Map Base Tile Layers ---
const tileLayers = {
    dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }),
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 18
    }),
    light: L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    })
};

// Initialize Map
const map = L.map('map', {
    center: [EPICENTER_LAT, EPICENTER_LON],
    zoom: 9,
    layers: [tileLayers.dark], // Default layer
    zoomControl: false // Custom placement in CSS
});

// Re-add Zoom control to bottom-left
L.control.zoom({ position: 'bottomleft' }).addTo(map);

// --- Spatial Utilities ---
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371.0; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
              
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Calculate the shortest distance from a point to a polyline
function getDistanceToPolyline(lat, lon, feature) {
    const geom = feature.geometry;
    let minDistance = Infinity;
    let closestPoint = null;
    
    if (geom.type === 'LineString') {
        geom.coordinates.forEach(pt => {
            const d = haversineDistance(lat, lon, pt[1], pt[0]);
            if (d < minDistance) {
                minDistance = d;
                closestPoint = pt;
            }
        });
    } else if (geom.type === 'MultiLineString') {
        geom.coordinates.forEach(line => {
            line.forEach(pt => {
                const d = haversineDistance(lat, lon, pt[1], pt[0]);
                if (d < minDistance) {
                    minDistance = d;
                    closestPoint = pt;
                }
            });
        });
    }
    
    return { distance: minDistance, point: closestPoint };
}

// Find closest tectonic feature
function findNearestTectonicFeatures() {
    let closestLineament = { distance: Infinity, feature: null, index: -1 };
    
    tectonicData.features.forEach((feat, idx) => {
        const { distance, point } = getDistanceToPolyline(EPICENTER_LAT, EPICENTER_LON, feat);
        
        // General nearest lineament
        if (distance < closestLineament.distance) {
            closestLineament = { distance, feature: feat, index: idx, point };
        }
    });
    
    return { closestLineament };
}

// --- Map Overlays & Styling ---

// Epicenter Layer
const epicenterIcon = L.divIcon({
    className: 'custom-epicenter-icon',
    html: `
        <div class="epicenter-glow-container">
            <div class="epicenter-core"></div>
            <div class="epicenter-ring"></div>
            <div class="epicenter-ring-2"></div>
        </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

const epicenterMarker = L.marker([EPICENTER_LAT, EPICENTER_LON], { icon: epicenterIcon });

// Build Popup content for Epicenter
const epicenterPopupContent = `
    <div class="popup-container">
        <div class="popup-title">EARTHQUAKE EPICENTER</div>
        <div class="popup-row"><span class="label">Date:</span><span class="val">July 4, 2026</span></div>
        <div class="popup-row"><span class="label">Time (MST):</span><span class="val">06:51:08</span></div>
        <div class="popup-row"><span class="label">Magnitude:</span><span class="val" style="color:#ff3838; font-weight:700;">3.5 M</span></div>
        <div class="popup-row"><span class="label">Depth:</span><span class="val">15 km</span></div>
        <div class="popup-row"><span class="label">Coordinates:</span><span class="val">16.98°N, 96.01°E</span></div>
        <div class="popup-row"><span class="label">Location:</span><span class="val">3 mi S-SE of Htantabin</span></div>
        <div class="popup-row" style="margin-top:6px; border-top: 1px solid rgba(255,255,255,0.08); padding-top:4px;">
            <span class="label">Source:</span><span class="val">DMH Myanmar</span>
        </div>
    </div>
`;
epicenterMarker.bindPopup(epicenterPopupContent);

// Buffer Circles Layer (10km, 25km, 50km)
const bufferCircles = L.featureGroup([
    L.circle([EPICENTER_LAT, EPICENTER_LON], {
        radius: 10000, // 10km
        color: '#ff3838',
        weight: 1.5,
        opacity: 0.4,
        fillColor: '#ff3838',
        fillOpacity: 0.03,
        dashArray: '3, 4'
    }).bindTooltip("10 km Buffer", { sticky: true, className: 'buffer-tooltip' }),
    L.circle([EPICENTER_LAT, EPICENTER_LON], {
        radius: 25000, // 25km
        color: '#ff9f43',
        weight: 1.5,
        opacity: 0.35,
        fillColor: '#ff9f43',
        fillOpacity: 0.015,
        dashArray: '5, 5'
    }).bindTooltip("25 km Buffer", { sticky: true, className: 'buffer-tooltip' }),
    L.circle([EPICENTER_LAT, EPICENTER_LON], {
        radius: 50000, // 50km
        color: '#ffffff',
        weight: 1,
        opacity: 0.25,
        fillColor: 'transparent',
        dashArray: '6, 6'
    }).bindTooltip("50 km Buffer", { sticky: true, className: 'buffer-tooltip' })
]);

// Styling configurations for Tectonic Lineaments
function getFeatureStyle(feature) {
    return {
        color: '#ff9f43', // Uniform glowing amber fault lines
        weight: 2.0,
        opacity: 0.6,
        lineCap: 'round',
        lineJoin: 'round'
    };
}

// Global active highlighted layer reference
let highlightedLayer = null;

function highlightTectonicFeature(layer) {
    if (highlightedLayer) {
        tectonicGeoJSONLayer.resetStyle(highlightedLayer);
    }
    
    highlightedLayer = layer;
    layer.setStyle({
        color: '#ff9f43',
        weight: 5,
        opacity: 0.95
    });
    
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

function selectFeatureOnMap(feature, layer) {
    highlightTectonicFeature(layer);
    
    const props = feature.properties;
    const name = props.NAME || "Unnamed Lineament";
    const segment = props.SEGMENT || "Not specified";
    const type = props.TYPE_DESCR || "Tectonic fault line / lineament";
    const code = props.CODE || "N/A";
    
    const { distance } = getDistanceToPolyline(EPICENTER_LAT, EPICENTER_LON, feature);
    
    // Update Map Floating Overlay Details Card
    document.getElementById('overlay-fault-name').innerText = name;
    
    const bodyHtml = `
        <div class="overlay-info-row">
            <span class="overlay-info-label">Fault Code:</span>
            <span class="overlay-info-val">${code}</span>
        </div>
        <div class="overlay-info-row">
            <span class="overlay-info-label">Segment:</span>
            <span class="overlay-info-val">${segment}</span>
        </div>
        <div class="overlay-info-row">
            <span class="overlay-info-label">Classification:</span>
            <span class="overlay-info-val">${type}</span>
        </div>
        <div class="overlay-info-row" style="margin-top:6px; border-top:1px solid rgba(255,255,255,0.08); padding-top:6px;">
            <span class="overlay-info-label" style="color:var(--primary); font-weight:600;">Epicenter Proximity:</span>
            <span class="overlay-info-val" style="color:var(--primary); font-weight:700; font-family:'JetBrains Mono';">${distance.toFixed(2)} km</span>
        </div>
    `;
    
    document.getElementById('overlay-fault-body').innerHTML = bodyHtml;
    document.getElementById('fault-info-overlay').classList.remove('hidden');
}

// Build GeoJSON layer
let geojsonLayerMap = {}; // Maps feature index to Leaflet layer object

const tectonicGeoJSONLayer = L.geoJSON(tectonicData, {
    style: getFeatureStyle,
    onEachFeature: function(feature, layer) {
        // Map feature by its index in the array or some ID if available
        // We find the index in the original array
        const idx = tectonicData.features.indexOf(feature);
        geojsonLayerMap[idx] = layer;
        
        // If the feature is named, let's index it by its lowercase name too for lookup
        if (feature.properties.NAME) {
            const key = feature.properties.NAME.toLowerCase().replace(/\s+/g, '-');
            geojsonLayerMap[key] = layer;
        }

        layer.on({
            mouseover: function(e) {
                const lyr = e.target;
                if (lyr !== highlightedLayer) {
                    lyr.setStyle({
                        weight: lyr.options.weight + 1.5,
                        opacity: Math.min(lyr.options.opacity + 0.15, 1)
                    });
                }
            },
            mouseout: function(e) {
                const lyr = e.target;
                if (lyr !== highlightedLayer) {
                    tectonicGeoJSONLayer.resetStyle(lyr);
                }
            },
            click: function(e) {
                L.DomEvent.stopPropagation(e);
                selectFeatureOnMap(feature, layer);
                map.fitBounds(layer.getBounds(), { padding: [100, 100] });
            }
        });
        
        // Bind Tooltip
        const name = feature.properties.NAME || "Unnamed Lineament";
        const type = feature.properties.TYPE_DESCR ? ` (${feature.properties.TYPE_DESCR})` : '';
        layer.bindTooltip(`${name}${type}`, { sticky: true });
    }
});

// Add default layers to map
tectonicGeoJSONLayer.addTo(map);
epicenterMarker.addTo(map);
// Buffer Circles start OFF by default in HTML switch, can be toggled.

// Adjust initial view to contain the epicenter and surrounding local lineaments
map.setView([EPICENTER_LAT, EPICENTER_LON], 9);

// Close overlay function
window.hideFaultOverlay = function() {
    document.getElementById('fault-info-overlay').classList.add('hidden');
    if (highlightedLayer) {
        tectonicGeoJSONLayer.resetStyle(highlightedLayer);
        highlightedLayer = null;
    }
};

// Map click closes overlay
map.on('click', function() {
    hideFaultOverlay();
});

// --- Focus Features on Map ---
window.focusOnFeature = function(identifier) {
    const layer = geojsonLayerMap[identifier];
    if (layer) {
        const feat = layer.feature;
        selectFeatureOnMap(feat, layer);
        map.fitBounds(layer.getBounds(), { padding: [100, 100], maxZoom: 11 });
        
        // Open sidebar details in mobile if sidebar closed
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth <= 900 && !sidebar.classList.contains('open')) {
            sidebar.classList.add('open');
        }
    }
};

// --- Page Initialization and Dynamic Data Loading ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Run Proximity Analysis
    const { closestLineament } = findNearestTectonicFeatures();
    
    // Update Sidebar Proximity Panel
    if (closestLineament.feature) {
        document.getElementById('near-lineament-val').innerText = `${closestLineament.distance.toFixed(2)} km`;
        document.getElementById('near-lineament-sub').innerText = closestLineament.feature.properties.NAME || `Lineament (#${closestLineament.index})`;
        // Setup focus button with index
        const cardLineament = document.getElementById('card-nearest-fault');
        cardLineament.querySelector('.focus-btn').setAttribute('onclick', `focusOnFeature(${closestLineament.index})`);
    }

    // 3. Setup Basemap switching
    const basemapButtons = document.querySelectorAll('.basemap-btn');
    basemapButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const style = btn.getAttribute('data-map');
            
            // Toggle active class
            basemapButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Switch tile layer on map
            Object.keys(tileLayers).forEach(key => {
                map.removeLayer(tileLayers[key]);
            });
            tileLayers[style].addTo(map);
        });
    });

    // 4. Setup Overlay Toggle Inputs
    const toggleLineaments = document.getElementById('toggle-lineaments');
    toggleLineaments.addEventListener('change', () => {
        if (toggleLineaments.checked) {
            map.addLayer(tectonicGeoJSONLayer);
        } else {
            map.removeLayer(tectonicGeoJSONLayer);
            hideFaultOverlay();
        }
    });

    const toggleEpicenter = document.getElementById('toggle-epicenter');
    toggleEpicenter.addEventListener('change', () => {
        if (toggleEpicenter.checked) {
            map.addLayer(epicenterMarker);
        } else {
            map.removeLayer(epicenterMarker);
        }
    });

    const toggleBuffers = document.getElementById('toggle-buffers');
    toggleBuffers.addEventListener('change', () => {
        if (toggleBuffers.checked) {
            map.addLayer(bufferCircles);
        } else {
            map.removeLayer(bufferCircles);
        }
    });

    // 5. Sidebar Toggle for Mobile/Tablet layout
    const sidebarToggle = document.getElementById('sidebar-toggle-btn');
    const sidebar = document.getElementById('sidebar');
    
    sidebarToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('open');
    });

    // Click outside sidebar on mobile closes it
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 900 && sidebar.classList.contains('open')) {
            if (!sidebar.contains(e.target) && e.target !== sidebarToggle && !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });
});

// Toggle visibility of official announcement graphic
window.toggleAnnouncementImage = function() {
    const container = document.getElementById('announcement-img-container');
    const btn = document.getElementById('view-announcement-btn');
    container.classList.toggle('expanded');
    if (container.classList.contains('expanded')) {
        btn.innerHTML = '<i class="fa-solid fa-image-slash"></i> Hide Official Graphic';
    } else {
        btn.innerHTML = '<i class="fa-solid fa-image"></i> View Official Graphic';
    }
};

