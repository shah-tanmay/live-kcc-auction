export function formatPoints(value) {
  if (value >= 100000) {
    return `${value / 100000}L`;
  } else if (value >= 1000) {
    return `${value / 1000}k`;
  } else {
    return value.toString();
  }
}
