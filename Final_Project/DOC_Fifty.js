var accessToken = 'pk.eyJ1IjoiZGFuaWVseHUwMiIsImEiOiJjbGt1MDkzNGgwMGV2M2xuMW84OTJqbDB3In0.NQElXto7ajMqUOraEvnFWQ';
var trailsVisible = true;
var stationsVisible = true;

var satelliteLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=' + accessToken, {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
});

var openStreetMapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

function initialize() {
    var map = L.map("map", {
        center: [43.8657, -72.0370],
        zoom: 10,
        layers: [satelliteLayer]
    });

    var baseMaps = {
        "Satellite": satelliteLayer,
        "OpenStreetMap": openStreetMapLayer
    };

    L.control.layers(baseMaps).addTo(map);

    loadMapData(map);
    setupEventListeners(map);
}

function loadMapData(map) {
    var trailsResponse = $.ajax({
        url: "The_DOC_Fifty_Trail.geojson",
        dataType: "json"
    });

    var stationsResponse = $.ajax({
        url: "The_DOC_Fifty_Support_Stations.geojson",
        dataType: "json"
    });

    $.when(trailsResponse, stationsResponse).done(function (trailsData, stationsData) {
        addTrailsLayer(map, trailsData[0]);
        addStationsLayer(map, stationsData[0]);
    });
}

function addTrailsLayer(map, data) {
    var trailslayer = L.geoJson(data, {
        style: function () {
            return {
                color: map.hasLayer(openStreetMapLayer) ? "#006400" : "#FFFFFF",
                weight: 3,
                opacity: 1,
                dashArray: "5, 5"
            }
        },
        onEachFeature: function (feature, layer) {
            bindTrailPopups(map, layer, feature, trailslayer);
        }
    }).addTo(map);
}

function addStationsLayer(map, data) {
    var stationslayer = L.geoJson(data, {
        style: {
            color: "#a1d76a",
            weight: 2,
            opacity: 1,
            dashArray: "solid"
        },
        onEachFeature: function (feature, layer) {
            bindStationPopups(map, layer, feature);
        }
    }).addTo(map);
}

function bindTrailPopups(map, layer, feature, trailslayer) {
    layer.bindPopup("<b>Name: " +
        feature.properties.name + "</b><br>" +
        "Starting Point: " +
        feature.properties.start_poin + "<br>" +
        "Ending Point: " +
        feature.properties.end_point + "<br>" +
        "Elevation Gain (ft): " +
        feature.properties.elev_ft + "<br>" +
        "Mileage: " +
        feature.properties.dist_miles);

    layer.on('click', function (e) {
        trailslayer.eachLayer(function (l) {
            l.setStyle({
                color: "#FFFFFF",
                weight: 3,
                opacity: 1,
                dashArray: "5, 5"
            });
        });
        layer.setStyle({
            color: "#FFFF00"
        });
        var bounds = layer.getBounds();
        var center = bounds.getCenter();
        map.setView(center, 12);
        e.target.openPopup();
    });

    layer.on('popupclose', function () {
        map.setView([43.8657, -72.0370], 10);
        trailslayer.setStyle({
            color: map.hasLayer(openStreetMapLayer) ? "#006400" : "#FFFFFF"
        });
    });
}

function bindStationPopups(map, layer, feature) {
    var galleryHtml = '';
    for (var i = 1; i <= 5; i++) {
        if (feature.properties['IMG' + i]) {
            galleryHtml += '<img src="' + feature.properties['IMG' + i] + '" alt="Trail Image" class="popup-image">';
        }
    }
    var popupContent = "<b>Station Name: " +
        feature.properties.Name + "</b><br>" +
        "Food: " +
        feature.properties.Food + "<br>" +
        "Total Miles Hiked: " +
        feature.properties.Mileage + "<br>" +
        "Total Elevation Gain (ft): " +
        feature.properties.Elev_gain + "<br>" +
        galleryHtml;

    layer.bindPopup(popupContent);

    layer.on('click', function () {
        map.setView(layer.getLatLng(), 14);
    });

    layer.on('popupclose', function () {
        map.setView([43.8657, -72.0370], 10);
    });
}

function setupEventListeners(map) {
    $("#toggleTrails").click(function () {
        if (trailsVisible) {
            trailsVisible = false;
            trailslayer.removeFrom(map);
        } else {
            trailsVisible = true;
            trailslayer.addTo(map);
        }
    });

    $("#toggleStations").click(function () {
        if (stationsVisible) {
            stationsVisible = false;
            stationslayer.removeFrom(map);
        } else {
            stationsVisible = true;
            stationslayer.addTo(map);
        }
    });

    $("#homeButton").click(function () {
        map.setView([43.8657, -72.0370], 10);
    });

    map.on('baselayerchange', function (event) {
        if (event.name === 'OpenStreetMap') {
            trailslayer.setStyle({
                color: "#006400"
            });
        } else {
            trailslayer.setStyle({
                color: "#FFFFFF"
            });
        }
    });
}

// Call the initialize function when the document is ready
$(document).ready(initialize);