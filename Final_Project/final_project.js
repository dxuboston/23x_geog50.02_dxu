var accessToken =
  "pk.eyJ1IjoiZGFuaWVseHUwMiIsImEiOiJjbGt1MDkzNGgwMGV2M2xuMW84OTJqbDB3In0.NQElXto7ajMqUOraEvnFWQ";

var trailsVisible = true;
var stationsVisible = true;

var satelliteLayer = L.tileLayer(
  "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=" +
    accessToken,
  {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
  }
);

var openStreetMapLayer = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
);

var highlightedTrailLayer = null;

function initialize() {
  var map = L.map("map", {
    center: [43.8657, -72.037],
    zoom: 10,
    scrollWheelZoom: false,
    layers: [satelliteLayer]
  });

  var baseMaps = {
    Satellite: satelliteLayer,
    OpenStreetMap: openStreetMapLayer
  };

  L.control.layers(baseMaps).addTo(map);

  var trailsResponse = $.ajax({
    url: "https://assets.codepen.io/10810196/The_DOC_Fifty_Trail.geojson",
    dataType: "json"
  });

  var stationsResponse = $.ajax({
    url:
      "https://assets.codepen.io/10810196/The_DOC_Fifty_Support_Stations.geojson",
    dataType: "json"
  });

  $.when(trailsResponse, stationsResponse).done(function (
    trailsData,
    stationsData
  ) {
    var trailslayer = L.geoJson(trailsData[0], {
      style: {
        color: "#FFFFFF",
        weight: 3,
        opacity: 1,
        dashArray: "5, 5"
      },
      onEachFeature: function (feature, layer) {
        layer.on("click", function (e) {
          if (highlightedTrailLayer) {
            highlightedTrailLayer.setStyle({
              color: "#FFFFFF"
            });
          }

          layer.setStyle({
            color: "#FFFF00"
          });

          highlightedTrailLayer = layer;

          var bounds = layer.getBounds();
          var center = bounds.getCenter();
          map.setView(center, 12);

          document.getElementById("info-content").innerHTML =
            "<b>Name: " +
            feature.properties.name +
            "</b><br>" +
            "Starting Point: " +
            feature.properties.start_poin +
            "<br>" +
            "Ending Point: " +
            feature.properties.end_point +
            "<br>" +
            "Elevation Gain (ft): " +
            feature.properties.elev_ft +
            "<br>" +
            "Mileage: " +
            feature.properties.dist_miles;
        });
      }
    }).addTo(map);

    var stationslayer = L.geoJson(stationsData[0], {
      style: {
        color: "#a1d76a",
        weight: 2,
        opacity: 1,
        dashArray: "solid"
      },
      onEachFeature: function (feature, layer) {
        var galleryHtml = '<div class="popup-gallery">';
        for (var i = 1; i <= 5; i++) {
          if (feature.properties["IMG" + i]) {
            galleryHtml +=
              '<img src="' +
              feature.properties["IMG" + i] +
              '" alt="Trail Image" class="popup-image">';
          }
        }
        galleryHtml += "</div>";
        var popupContent =
          "<b>Station Name: " +
          feature.properties.Name +
          "</b><br>" +
          "Food: " +
          feature.properties.Food +
          "<br>" +
          "Total Miles Hiked: " +
          feature.properties.Mileage +
          "<br>" +
          "Total Elevation Gain (ft): " +
          feature.properties.Elev_gain +
          "<br>" +
          "<br>" +
          feature.properties.notes +
          "<br>" +
          galleryHtml +
          "<br>" +
          feature.properties.credits;

        layer.on("click", function () {
          document.getElementById("info-content").innerHTML = popupContent;
        });

        layer.on("click", function () {
          map.setView(layer.getLatLng(), 14);
        });
      }
    }).addTo(map);

    $("#toggleTrails").show();
    $("#toggleStations").show();

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
      map.setView([43.8657, -72.037], 10);
      document.getElementById("info-content").innerHTML =
        "Click on a trail or station to display details";

      if (highlightedTrailLayer) {
        if (map.hasLayer(openStreetMapLayer)) {
          highlightedTrailLayer.setStyle({
            color: "#FFFF00"
          });
        } else {
          highlightedTrailLayer.setStyle({
            color: "#FFFFFF"
          });
        }
      }
    });

    map.on("baselayerchange", function (event) {
      if (highlightedTrailLayer) {
        if (event.name === "OpenStreetMap") {
          highlightedTrailLayer.setStyle({
            color: "#FFFF00"
          });
        } else {
          highlightedTrailLayer.setStyle({
            color: "#FFFFFF"
          });
        }
      }
    });
  });
}

var items = document.querySelectorAll(".timeline li");

function isElementInViewport(el) {
  var rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function callbackFunc() {
  for (var i = 0; i < items.length; i++) {
    if (isElementInViewport(items[i])) {
      if (!items[i].classList.contains("in-view")) {
        items[i].classList.add("in-view");
      }
    } else if (items[i].classList.contains("in-view")) {
      items[i].classList.remove("in-view");
    }
  }
}

window.addEventListener("load", callbackFunc);
window.addEventListener("scroll", callbackFunc);

document.querySelector(".top").addEventListener("click", function (e) {
  e.preventDefault();
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    const target = document.querySelector(this.getAttribute("href"));
    const targetHeight = target.offsetHeight;
    const windowHeight = window.innerHeight;
    const offsetTop = target.getBoundingClientRect().top + window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight;

    let centeredPosition = offsetTop - windowHeight / 2 + targetHeight / 2;

    if (centeredPosition < 0) {
      centeredPosition = offsetTop;
    } else if (centeredPosition + windowHeight > docHeight) {
      centeredPosition = docHeight - windowHeight;
    }

    window.scrollTo({
      top: centeredPosition,
      behavior: "smooth"
    });
  });
});

$(document).ready(function () {
  initialize();
});
