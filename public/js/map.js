//Copied, for Map displaying
const map = L.map('map').setView([listingCoordinates[1], listingCoordinates[0]], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19
}).addTo(map);


// Optional: Add marker
// L.marker([listingCoordinates[1], listingCoordinates[0]]).addTo(map)
//     .bindPopup('Listing location')
//     .openPopup();


// Define a red marker icon
const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

// Add marker using the red icon
L.marker([listingCoordinates[1], listingCoordinates[0]], { icon: redIcon })
  .addTo(map)
  .bindPopup('Exact location after booking')
  .on('click', function(e) {
      // This will open the popup when marker is clicked
      this.openPopup();
    });
