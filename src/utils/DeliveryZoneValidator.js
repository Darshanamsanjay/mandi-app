export const MANDI_COORDS = { lat: 17.3616, lng: 78.4747 };
export const MAX_DELIVERY_DISTANCE_KM = 5;

// Haversine formula to calculate distance in km
export function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Check if coordinates are within the 5KM delivery radius
export function isWithinDeliveryZone(lat, lng) {
  if (!lat || !lng) return false;
  const distance = getDistanceFromLatLonInKm(MANDI_COORDS.lat, MANDI_COORDS.lng, lat, lng);
  return distance <= MAX_DELIVERY_DISTANCE_KM;
}
