
// NYC - Leaflet Map
// 
const map = L.map('map', { scrollWheelZoom: true }).setView([40.730610, -73.935242], 10);


// Base layers
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19, attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
const carto = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  maxZoom: 20, attribution: '&copy; OpenStreetMap & Carto'
});
// Map setup
// --- Layers ---

let scenarioLayer = null;

// Base HVI file path
const baseFile = "data/hvi.geojson";

// Scenario files
const scenarioFiles = {
    0: NaN,
    10: "Data/10_HVI.geojson",
    20: "Data/20_HVI.geojson",
    30: "Data/30_HVI.geojson",
    40: "Data/40_HVI.geojson",
    50: "Data/50_HVI.geojson",
    60: "Data/60_HVI.geojson",
    70: "Data/70_HVI.geojson",
    80: "Data/80_HVI.geojson",
    90: "Data/90_HVI.geojson",
    100:"Data/100_HVI.geojson"
};

// --- Load BASELINE layer and keep it forever ---
fetch(baseFile)
    .then(r => r.json())
    .then(data => {
        baselineLayer = L.geoJSON(data, {
            style: feature => ({
                fillColor: getColorBase(feature.properties.HVI__1_5_),
                fillOpacity: 0.7,
                color: "#111",
                weight: 0.8
            }),
            onEachFeature: function (feature, layer) {
                layer.bindPopup("<b>Baseline HVI</b><br>" +
                    "Name: " + feature.properties.NTAName + "<br>" +
                    "Borough: " + feature.properties.BoroName + "<br>" +
                    "HVI Score: " + feature.properties.HVI__1_5_) ;
            }
        }).addTo(map);
    });


// --- Load scenario controlled by slider ---
function loadScenario(value) {

    // Remove ONLY scenario layer
    if (scenarioLayer !== null) {
        map.removeLayer(scenarioLayer);
    }

    fetch(scenarioFiles[value])
        .then(r => r.json())
        .then(data => {
            scenarioLayer = L.geoJSON(data, {
                style: feature => ({
                    fillColor: getColor(feature.properties.ratio_change),
                    fillOpacity: 0.45,   // transparent so baseline is visible underneath
                    color: "#333",
                    weight: 0.5
                }),
                onEachFeature: function (feature, layer) {
                    layer.bindPopup(
                      "<b>Name:</b> " + feature.properties.Name + "<br>" +
                      "<b>Borough:</b> " + feature.properties.Borough + "<br>" +
                      "<b>HVI Score:</b> " + feature.properties.HVI_quintile
                    );
                }
            }).addTo(map);
        });
}


// --- Color scale ---
function getColor(r) {
  return r < 0.95 ? "rgba(198, 219, 239, 0.55)" :  // pale blue
         r < 1.00 ? "rgba(158, 202, 225, 0.60)" :  // mid blue
         r < 1.05 ? "rgba(107, 174, 214, 0.65)" :  // stronger blue
                     "rgba(33, 113, 181, 0.70)";   // deep blue
}
function getColorBase(r) {
    return r === 1 ? "#ffffb2" :
           r === 2 ? "#fecc5c" :
           r === 3 ? "#fd8d3c" :
           r === 4 ? "#f03b20" :
           r === 5 ? "#bd0026" :
           "#000000"; // Default color if no match
}


// --- Slider ---
const VegSlider = document.getElementById("vegSlider");
const vegSliderValueDisplay = document.getElementById("vegSliderValue");

vegSliderValueDisplay.textContent = VegSlider.value;

VegSlider.addEventListener("input", function () {
    loadScenario(this.value);
    vegSliderValueDisplay.textContent = this.value;
});


// --- Legend ---
var legend = L.control({ position: 'bottomright' });

// --- Build legend inside sidebar ---
function buildLegend() {
    const legend = document.getElementById("combined-legend");

    legend.innerHTML = `
      <div class="legend-section">
        <div class="legend-title">HVI Base Layer</div>

        <div class="legend-row"><div class="legend-box" style="background:#ffffb2;"></div><span>1</span></div>
        <div class="legend-row"><div class="legend-box" style="background:#fecc5c;"></div><span>2</span></div>
        <div class="legend-row"><div class="legend-box" style="background:#fd8d3c;"></div><span>3</span></div>
        <div class="legend-row"><div class="legend-box" style="background:#f03b20;"></div><span>4</span></div>
        <div class="legend-row"><div class="legend-box" style="background:#bd0026;"></div><span>5</span></div>
      </div>

      <div class="legend-section">
        <div class="legend-title">Vegetation Ratio Change</div>

        <div class="legend-row"><div class="legend-box" style="background:rgba(198,219,239,0.55);"></div><span> Strong Improvement</span></div>
        <div class="legend-row"><div class="legend-box" style="background:rgba(158,202,225,0.60);"></div><span> Moderate </span></div>
        <div class="legend-row"><div class="legend-box" style="background:rgba(107,174,214,0.65);"></div><span> Slight </span></div>
        <div class="legend-row"><div class="legend-box" style="background:rgba(33,113,181,0.70);"></div><span> Worsening </span></div>
      </div>
    `;
}

// Call it after the map is initialized
buildLegend();




// Load initial scenario (0% vegetation)
loadScenario(null);


map.options.minZoom = 8;
