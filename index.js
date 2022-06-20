const filters = ['tourism=attraction', 'historic=castle', 'historic=railway_car', 'historic=ship', 'tourism=viewpoint', 'building=church'];
const intresting_tags = ['tourism', 'opening_hours', 'website', 'historic', 'building'];
var resultLayer = null;
var map = L.map('map').setView([50.1174, 8.684], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 4,
    attribution: '© OpenStreetMap'
}).addTo(map);



function buildOverpassApiUrl(map = map, overpassQuery) {
    var bounds = map.getBounds().getSouth() + ',' + map.getBounds().getWest() + ',' + map.getBounds().getNorth() + ',' + map.getBounds().getEast();
    var nwrQuery = '('
    overpassQuery.forEach(option => {
        nwrQuery += 'nwr[' + option + '](' + bounds + ');';
    });
    nwrQuery += ');'

    // var nwrQuery = 'nwr[' + overpassQuery + '](' + bounds + ');'; // points

    var query = '?data=[out:json][timeout:15];' + nwrQuery + 'out body geom;';
    var baseUrl = 'http://overpass-api.de/api/interpreter';
    var resultUrl = baseUrl + query;
    return resultUrl;
}

function createLayer(filter = filters) {
    var overpassApiUrl = buildOverpassApiUrl(map, filter);

    $.get(overpassApiUrl, function (osmDataAsJson) {
        var resultAsGeojson = osmtogeojson(osmDataAsJson);
        resultLayer = L.geoJson(resultAsGeojson, {
            style: function (feature) {
                return { color: '#ff0000' };
            },
            onEachFeature: function (feature, layer) {
                var name = feature.properties.tags['name']
                if (name == undefined) {
                    name = 'Unbekannter Name'
                }
                var popupContent = '' + '<dt>' + name + '</dt><dd>' + '</dd>';
                var keys = Object.keys(feature.properties.tags);
                keys.forEach(function (key) {
                    if (intresting_tags.includes(key)) {
                        popupContent = popupContent + '<dt>' + key + '</dt><dd>' + feature.properties.tags[key] + '</dd>';
                    }
                });
                popupContent = popupContent + '</dl>';
                layer.bindPopup(popupContent);
            }
        }).addTo(map);
    });
    return resultLayer;
}

resultLayer = createLayer();


map.on('moveend', function () { // after the map get moved or zoomed the map will refresh
    map.removeLayer(resultLayer);
    if (map.getZoom() >= 9) {
        resultLayer = createLayer(filters);
    }
});