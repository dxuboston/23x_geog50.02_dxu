
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
                scrollWheelZoom: false,
                layers: [satelliteLayer]
            });

            var baseMaps = {
                "Satellite": satelliteLayer,
                "OpenStreetMap": openStreetMapLayer
            };

            L.control.layers(baseMaps).addTo(map);

            var trailsResponse = $.ajax({
                url: "The_DOC_Fifty_Trail.geojson",
                dataType: "json"
            });

            var stationsResponse = $.ajax({
                url: "The_DOC_Fifty_Support_Stations.geojson",
                dataType: "json"
            });

            $.when(trailsResponse, stationsResponse).done(function (trailsData, stationsData) {
                var trailslayer = L.geoJson(trailsData[0], {
                    style: {
                        color: "#FFFFFF",
                        weight: 3,
                        opacity: 1,
                        dashArray: "5, 5"
                    },
                    onEachFeature: function (feature, layer) {
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

                            if (map.hasLayer(openStreetMapLayer)) {
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
                }).addTo(map);

                var stationslayer = L.geoJson(stationsData[0], {
                    style: {
                        color: "#a1d76a",
                        weight: 2,
                        opacity: 1,
                        dashArray: "solid"
                    },
                    onEachFeature: function (feature, layer) {
                        var galleryHtml = '<div class="popup-gallery">'; // Start the gallery div
for (var i = 1; i <= 5; i++) {
    if (feature.properties['IMG' + i]) {
        galleryHtml += '<img src="' + feature.properties['IMG' + i] + '" alt="Trail Image" class="popup-image">';
    }
}
galleryHtml += '</div>'; // Close the gallery div
                        var popupContent = "<b>Station Name: " +
                            feature.properties.Name + "</b><br>" +
                            "Food: " +
                            feature.properties.Food + "<br>" +
                            "Total Miles Hiked: " +
                            feature.properties.Mileage + "<br>" +
                            "Total Elevation Gain (ft): " +
                            feature.properties.Elev_gain + "<br>" + "<br>" +
                            feature.properties.notes + "<br>" +
                            galleryHtml + "<br>" +
                            feature.properties.credits;

                        layer.bindPopup(popupContent, {maxWidth: 400});

                        layer.on('click', function () {
                            map.setView(layer.getLatLng(), 14);
                        });

                        layer.on('popupclose', function () {
                            map.setView([43.8657, -72.0370], 10);

                            if (map.hasLayer(openStreetMapLayer)) {
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
                    map.setView([43.8657, -72.0370], 10);

                    if (map.hasLayer(openStreetMapLayer)) {
                        trailslayer.setStyle({
                            color: "#006400"
                        });
                    } else {
                        trailslayer.setStyle({
                            color: "#FFFFFF"
                        });
                    }

                    trailslayer.eachLayer(function (l) {
                        l.closePopup();
                    });
                    stationslayer.eachLayer(function (l) {
                        l.closePopup();
                    });
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
            });
        }
  
        var items = document.querySelectorAll(".timeline li");

        function isElementInViewport(el) {
          var rect = el.getBoundingClientRect();
          return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
          );
        }
        
        function callbackFunc() {
          for (var i = 0; i < items.length; i++) {
            if (isElementInViewport(items[i])) {
              if(!items[i].classList.contains("in-view")){
                items[i].classList.add("in-view");
              }
            } else if(items[i].classList.contains("in-view")) {
                items[i].classList.remove("in-view");
            }
          }
        }
         
        window.addEventListener("load", callbackFunc);
        window.addEventListener("scroll", callbackFunc);

   document.querySelector('.top').addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
  


   document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const target = document.querySelector(this.getAttribute('href'));
        const targetHeight = target.offsetHeight;
        const windowHeight = window.innerHeight;
        const offsetTop = target.getBoundingClientRect().top + window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight;

        // Calculate the centering offset
        let centeredPosition = offsetTop - (windowHeight / 2) + (targetHeight / 2);

        // If section is near the top of the document, scroll to the top of the section
        if (centeredPosition < 0) {
            centeredPosition = offsetTop;
        }

        // If section is near the bottom of the document, adjust to show the section at the bottom of the viewport
        else if (centeredPosition + windowHeight > docHeight) {
            centeredPosition = docHeight - windowHeight;
        }
        
        window.scrollTo({
            top: centeredPosition,
            behavior: 'smooth'
        });
    });
});
  


   $(document).ready(function() {
    initialize();
});
  