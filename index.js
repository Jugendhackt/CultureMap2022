var map = L.map('map').setView([50.1174, 8.684], 13);
var resultLayer = null;
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 4,
    attribution: '© OpenStreetMap'
}).addTo(map);



function buildOverpassApiUrl(map, overpassQuery) {
    var bounds = map.getBounds().getSouth() + ',' + map.getBounds().getWest() + ',' + map.getBounds().getNorth() + ',' + map.getBounds().getEast();
    var nodeQuery = 'node[' + overpassQuery + '](' + bounds + ');'; // points
    var wayQuery = 'way[' + overpassQuery + '](' + bounds + ');'; // line
    var relationQuery = 'relation[' + overpassQuery + '](' + bounds + ');'; //group of objects
    var query = '?data=[out:json][timeout:15];(' + nodeQuery + wayQuery + relationQuery + ');out body geom;';
    var baseUrl = 'http://overpass-api.de/api/interpreter';
    var resultUrl = baseUrl + query;
    return resultUrl;
}

function createLayer(filter = 'tourism=attraction') {
    var overpassApiUrl = buildOverpassApiUrl(map, filter);

    $.get(overpassApiUrl, function (osmDataAsJson) {
        var resultAsGeojson = osmtogeojson(osmDataAsJson);
        resultLayer = L.geoJson(resultAsGeojson, {
            style: function (feature) {
                return { color: '#ff0000' };
            },
            /* filter: function (feature, layer) {
                var isPolygon = (feature.geometry) && (feature.geometry.type !== undefined) && (feature.geometry.type === 'Polygon');
                if (isPolygon) {
                feature.geometry.type = 'Point';
                var polygonCenter = L.latLngBounds(feature.geometry.coordinates[0]).getCenter();
                feature.geometry.coordinates = [ polygonCenter.lat, polygonCenter.lng ];
                }
                return true;
            }, */
            onEachFeature: function (feature, layer) {
                var name = feature.properties.tags['name']
                if (name == undefined) {
                    name = 'Unbekannter Name'
                }
                var popupContent = '' + '<dt>' + name + '</dt><dd>' + '</dd>';
                var keys = Object.keys(feature.properties.tags);
                var intresting_tags = ['tourism', 'opening_hours', 'website'];
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
        resultLayer = createLayer();
    }
});