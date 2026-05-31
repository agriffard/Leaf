function markerToFeature(marker) {
  return {
    type: "Feature",
    properties: {
      popup: marker.popup || ""
    },
    geometry: {
      type: "Point",
      coordinates: [marker.longitude, marker.latitude]
    }
  };
}

function renderLeaflet(state, options) {
  if (!window.L) {
    throw new Error("Leaflet is required. Include Leaflet scripts in the host app.");
  }

  if (!state.map) {
    state.map = window.L.map(state.element);
    window.L.tileLayer(options.tileUrlTemplate, {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors"
    }).addTo(state.map);
  }

  state.map.setView([options.latitude, options.longitude], options.zoom);

  if (state.markersLayer) {
    state.map.removeLayer(state.markersLayer);
    state.markersLayer = null;
  }

  const markers = (options.markers || []).map((marker) => {
    const item = window.L.marker([marker.latitude, marker.longitude]);
    if (marker.popup) {
      item.bindPopup(marker.popup);
    }
    return item;
  });

  if (options.enableClustering && window.L.markerClusterGroup) {
    state.markersLayer = window.L.markerClusterGroup();
    markers.forEach((m) => state.markersLayer.addLayer(m));
    state.map.addLayer(state.markersLayer);
  } else {
    state.markersLayer = window.L.layerGroup(markers);
    state.map.addLayer(state.markersLayer);
  }

  if (options.enableDrawTool && window.L.Control?.Draw) {
    if (!state.drawnItems) {
      state.drawnItems = new window.L.FeatureGroup();
      state.map.addLayer(state.drawnItems);
      const drawControl = new window.L.Control.Draw({
        edit: { featureGroup: state.drawnItems }
      });
      state.map.addControl(drawControl);
    }
  }
}

function renderMapLibre(state, options) {
  if (!window.maplibregl) {
    throw new Error("MapLibre GL JS is required. Include MapLibre scripts in the host app.");
  }

  if (!state.map) {
    state.map = new window.maplibregl.Map({
      container: state.element,
      style: options.mapStyleUrl,
      center: [options.longitude, options.latitude],
      zoom: options.zoom
    });
    state.map.addControl(new window.maplibregl.NavigationControl(), "top-right");
  }

  state.map.flyTo({ center: [options.longitude, options.latitude], zoom: options.zoom });

  state.markers?.forEach((marker) => marker.remove());
  state.markers = [];

  const markers = options.markers || [];

  if (options.enableClustering && markers.length > 0) {
    const sourceData = {
      type: "FeatureCollection",
      features: markers.map(markerToFeature)
    };

    const setClusterLayers = () => {
      if (state.map.getSource("leaf-points")) {
        state.map.getSource("leaf-points").setData(sourceData);
        return;
      }

      state.map.addSource("leaf-points", {
        type: "geojson",
        data: sourceData,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 40
      });

      state.map.addLayer({
        id: "leaf-clusters",
        type: "circle",
        source: "leaf-points",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#2a9d8f",
          "circle-radius": 20
        }
      });

      state.map.addLayer({
        id: "leaf-cluster-count",
        type: "symbol",
        source: "leaf-points",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-size": 12
        }
      });

      state.map.addLayer({
        id: "leaf-unclustered-point",
        type: "circle",
        source: "leaf-points",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#264653",
          "circle-radius": 6
        }
      });
    };

    if (state.map.isStyleLoaded()) {
      setClusterLayers();
    } else {
      state.map.once("load", setClusterLayers);
    }
  } else {
    ["leaf-clusters", "leaf-cluster-count", "leaf-unclustered-point"].forEach((layerId) => {
      if (state.map.getLayer(layerId)) {
        state.map.removeLayer(layerId);
      }
    });

    if (state.map.getSource("leaf-points")) {
      state.map.removeSource("leaf-points");
    }

    markers.forEach((marker) => {
      const popup = marker.popup ? new window.maplibregl.Popup({ offset: 20 }).setHTML(marker.popup) : null;
      const mapMarker = new window.maplibregl.Marker()
        .setLngLat([marker.longitude, marker.latitude]);
      if (popup) {
        mapMarker.setPopup(popup);
      }
      mapMarker.addTo(state.map);
      state.markers.push(mapMarker);
    });
  }

  if (options.enableDrawTool && window.MapboxDraw && !state.drawControlAdded) {
    state.map.addControl(new window.MapboxDraw(), "top-left");
    state.drawControlAdded = true;
  }
}

export function createLeafMap(elementId, initialOptions) {
  const state = {
    element: document.getElementById(elementId),
    map: null,
    markers: null,
    markersLayer: null,
    drawnItems: null,
    drawControlAdded: false
  };

  const render = (options) => {
    if (!state.element) {
      return;
    }

    if (options.engine === "maplibre") {
      renderMapLibre(state, options);
    } else {
      renderLeaflet(state, options);
    }
  };

  render(initialOptions);

  return {
    update(nextOptions) {
      render(nextOptions);
    },
    dispose() {
      state.markers?.forEach((marker) => marker.remove());
      state.markers = [];
      if (state.map) {
        state.map.remove();
        state.map = null;
      }
    }
  };
}
