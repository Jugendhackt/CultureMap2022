var map = L.map('map').setView([51.477, 0], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

function addPoint(coordinates) {
    var marker = L.marker(coordinates);
    marker.addTo(map);
}

addPoint([51.477, 0]);