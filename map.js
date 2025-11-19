
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


var currentLayer = null;

// Scenario files
const scenarioFiles = {
    0: "data/base_HVI.geojson",
    10: "data/10_HVI.geojson",
    20: "data/20_HVI.geojson",
    30: "data/30_HVI.geojson",
    40: "data/40_HVI.geojson"
};

// Load a scenario layer
function loadScenario(value) {
    if (currentLayer) {
        map.removeLayer(currentLayer);
    }

    fetch(scenarioFiles[value])
        .then(r => {
           if (!r.ok) throw new Error(`Fetch failed: ${r.status}`);
            return r.json();
        })
        .then(data => {
            currentLayer = L.geoJSON(data, {
                style: feature => ({
                    fillColor: getColor(feature.properties.HVI_quintile),
                    fillOpacity: 0.7,
                    color: "#333",
                    weight: 0.5
                }),

            onEachFeature: function (feature, layer) {
                if (feature.properties) {
                    var popupContent =  "<b>Name: </b>" + feature.properties.Name + "<br>" +
                                       "<b>Borough: </b>" + feature.properties.Borough + "<br>" +
                                       "<b>HVI Score: </b>" + feature.properties.HVI_quintile + "<br>";
                    layer.bindPopup(popupContent);
                }
            }
        }).addTo(map);
      })
      .catch(err => {
            console.error("Error loading scenario:", err);
        });

}


// Color scale
function getColor(q) {
    return {
        1: "#ffffb2",
        2: "#fecc5c",
        3: "#fd8d3c",
        4: "#f03b20",
        5: "#bd0026"
    }[q];
}
// PopUps


// Slider listener
const VegSlider = document.getElementById('vegSlider');
const vegSliderValueDisplay = document.getElementById("vegSliderValue");

vegSliderValueDisplay.textContent = VegSlider.value;

document.getElementById("vegSlider").addEventListener("input", function () {
    loadScenario(this.value);
    vegSliderValueDisplay.textContent = this.value;



});
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function (_map) {
  var div = L.DomUtil.create('div', 'info legend');
    levels = [5, 4, 3, 2, 1];
    colors = "#bd0026", "#f03b20", "#fd8d3c", "#fecc5c", "#ffffb2";
    labels = [];
  for (var i = 0; i < levels.length; i++) {
      div.innerHTML +=
        '<i style="background:' + colors[i] + '"></i> ' +
          levels[i] + (levels[i + 1] ? '&ndash;' +levels[i + 1] + '<br>' : '+');
    return div;
};

  
 return div;
};

legend.addTo(map)
// Initial load
loadScenario(0);
map.options.minZoom = 8;  // limiting maps zoom out
map.fire(zoomend);
