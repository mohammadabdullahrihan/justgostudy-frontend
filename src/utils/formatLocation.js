// Combines a university's location + country into a single display string,
// avoiding redundancy when the location already mentions the country name.
export const formatLocation = (location, country) => {
  if (!location) return country || '';
  if (!country || location.toLowerCase().includes(country.toLowerCase())) return location;
  return `${location}, ${country}`;
};
