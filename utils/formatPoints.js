export function formatPoints(value) {
  if (value === null || value === undefined) return '0';
  const numValue = Number(value);
  if (isNaN(numValue)) return value?.toString() || '0';
  
  if (numValue >= 100000) {
    return `${numValue / 100000}L`;
  } else if (numValue >= 1000) {
    return `${numValue / 1000}k`;
  } else {
    return numValue.toString();
  }
}
