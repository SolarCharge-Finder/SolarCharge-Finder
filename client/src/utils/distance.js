//coodinates are accepted as [lng, lat] arrays
export const calculateDistance = (point1, point2) => {
  const toRad = value => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in KM

  const lat1 = point1[1];
  const lon1 = point1[0];
  const lat2 = point2[1];
  const lon2 = point2[0];

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in KM
};
