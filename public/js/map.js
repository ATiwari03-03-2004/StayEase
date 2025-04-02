let platform = new H.service.Platform({
  apikey: mapToken,
});
let defaultLayers = platform.createDefaultLayers();
let map = new H.Map(
  document.getElementById("map"),
  defaultLayers.vector.normal.map,
  {
    center: { lat: 20.5937, lng: 78.9629 },
    zoom: 4,
    pixelRatio: window.devicePixelRatio || 1,
  }
);

let mapSet = document.getElementById("map");
let cordinates = mapSet.classList.value;
let idx = cordinates.indexOf(" | ");
let lati = parseFloat(cordinates.slice(4, idx));
let lngi = parseFloat(cordinates.slice(idx + 7, cordinates.length));
window.addEventListener("resize", () => map.getViewPort().resize());
let behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
let ui = H.ui.UI.createDefault(map, defaultLayers);

let icon = new H.map.Icon(
  "https://res.cloudinary.com/dmnsftwem/image/upload/v1743022632/pngtree-house-location-pointer-vector-png-image_6648499_a1ygjg.png",
  { size: { w: 50, h: 50 } }
);
let title = document.querySelector(".row h3");
let marker = new H.map.Marker({ lat: lati, lng: lngi }, { icon: icon });
marker.addEventListener('pointerenter', function() {
  map.getViewPort().element.style.cursor = 'pointer';
});
marker.addEventListener('pointerleave', function() {
  map.getViewPort().element.style.cursor = 'default';
});
marker.addEventListener("tap", function (e) {
  ui.addBubble(
    new H.ui.InfoBubble(e.target.getGeometry(), {
      content: `<div style="white-space: nowrap; color: #fe424d;"><b>${title.innerText}</b></div>`,
    })
  );
});

function moveMapToListingLocation(map) {
  map.setCenter({ lat: lati, lng: lngi });
  map.setZoom(16);
  map.addObject(marker);
}
moveMapToListingLocation(map);
