"use strict";

function IndexController() {

  var that           = this,
      layers         = {},
      layerDataCache = {},
      dropZoneLayers = {
        "pointlayer": function(pages) {
          var hex = new L.HexbinLayer({
                  radius : 1,
                  opacity: 1
              }).addTo(that.map);
          hex.data(pages.filter(function(p){return (typeof p.geometry === "object" && p.geometry !== null)}).map(function(p) {return p.geometry.coordinates;}));
          return hex;
        },
        "hulllayer": STMN.hullLayer,
        "hexlayer": function(pages) {
          var hex = new L.HexbinLayer().addTo(that.map);
          hex.data(pages.filter(function(p){return (typeof p.geometry === "object" && p.geometry !== null)}).map(function(p) {return p.geometry.coordinates;}));
          return hex;
        }
      },
      baseLayer, baseLayerAdded, layerMenu;

  //
  // Convenience methods for browsers
  //
  that.utils = STPX.browsersugar.mix({});

  function initMap() {

    // create a map in the "map" div, set the view to a given place and zoom
    that.map = L.map("map", {
      "minZoom" : 2,
      "scrollWheelZoom" : false
    }).setView([37.5333, -77.4667], 2);

    //
    // Add base-layer
    //
    baseLayer = L.tileLayer("http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png", {
      attribution: "&copy; <a href=\"http://osm.org/copyright\">OpenStreetMap</a> contributors"
    });

    //
    // Control base-layer visibility
    //
    that.on("showLayer", function() {
      document.querySelector("#map-instruction").style.opacity = 0;
    });

    that.layerMenu.on("orderChanged", function(e) {

      e.caller.order.forEach(function(layerItem) {
        showLayer(layerItem);
      });
    });

  }

  function showMenuItemLoadState(layer) {

    var layerNode = layerMenu.getLayerNode(layer);

    that.utils.append(layerNode, "<div id=\"floatingCirclesG\" class=\"loading\"><div class=\"f_circleG\" id=\"frotateG_01\"></div><div class=\"f_circleG\" id=\"frotateG_02\"></div><div class=\"f_circleG\" id=\"frotateG_03\"></div><div class=\"f_circleG\" id=\"frotateG_04\"></div><div class=\"f_circleG\" id=\"frotateG_05\"></div><div class=\"f_circleG\" id=\"frotateG_06\"></div><div class=\"f_circleG\" id=\"frotateG_07\"></div><div class=\"f_circleG\" id=\"frotateG_08\"></div></div>");
  }

  function hideMenuItemLoadState(layer) {
    var layerNode   = layerMenu.getLayerNode(layer),
        loadingNode = layerNode.querySelector(".loading");

    if (loadingNode) {
      loadingNode.parentNode.removeChild(loadingNode);
    }
  }

  function initLayerMenu() {
    var layerMinNode    = document.querySelector("#legend-layer-menu-min"),
        layerPanelClose = document.querySelector("#legend-layer-menu .close-button");

    layerMenu = new STMN.LegendLayerMenu("#legend-layer-menu");
    that.layerMenu = layerMenu;

    //
    // when a layer is added, put it on the map
    //
    layerMenu.on("layerAdded", function (e) {

      var layer = e.caller;

      showMenuItemLoadState(layer);
      that.showLayer(layer, function() {
        hideMenuItemLoadState(layer);
      }); //Passing a layer object

    });

    //
    // In mobile view there is a button to open the layermenu
    // this opens it
    //
    layerMinNode.addEventListener("click", function(e) {

      if (!layerMenu.rootNode.classList.contains("open")) {
        layerMenu.rootNode.classList.add("open");
      } else {
        layerMenu.rootNode.classList.remove("open");
      }

    }, false);

    //
    // In mobile view there is a button to open the layermenu
    // this closes it
    //
    layerPanelClose.addEventListener("click", function(e) {

      layerMenu.rootNode.classList.remove("open");

    }, false);

  }

  function buildLayer(layerObject, pages) {

    if (typeof layers[layerObject.id] === "object") {
      that.map.removeLayer(layers[layerObject.id]);
      delete layers[layerObject.id];
    }

    layers[layerObject.id] = dropZoneLayers[layerObject.list](pages, {
      color : "red"
    });

    that.map.addLayer(layers[layerObject.id]);
  }

  function showLayer(layerObject, callback) {

    if (typeof baseLayerAdded !== "boolean") {
      baseLayer.addTo(that.map);
      baseLayerAdded = true;
    }

    //
    // At this time we will only fetch a layer once per page load
    // for that reason we can assume that if we have data for a layer
    // we can use it. One could force an update by deleting the
    // cache entry for a layer
    //
    if (layerDataCache[layerObject.id]) {

      buildLayer(layerObject, layerDataCache[layerObject.id]);

    } else {

      return (new STMN.EcoengineClient).requestRecursive(layerObject.uri,
      function(pages) { //Done

        layerDataCache[layerObject.id] = pages;
        buildLayer(layerObject, pages);

        that.fire("showLayer");

        if (typeof callback === "function") {
          callback();
        }
      },
      function(pages) { //Progress

        buildLayer(layerObject, pages);

        that.fire("showLayerProgress");
      });

    }

  }

  function hideLayer(id, list) {

    console.log(layers[id]._map);

    that.map.removeLayer(layers[id]);

    that.fire("showLayer", {
      layer : layers[id]
    });

  }

  //
  // Public interface
  //
  that.showLayer = showLayer;
  that.hideLayer = hideLayer;
  that.showMenuItemLoadState = showMenuItemLoadState;
  that.hideMenuItemLoadState = hideMenuItemLoadState;

  //
  // Init
  //
  initLayerMenu();
  initMap();

  return that;

}

(new (STPX.samesies.extend(IndexController))());
