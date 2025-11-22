export function generateSequence(type, id) {
  const prefix = type === 'receipt' ? 'WH/IN' : 'WH/OUT';
  const paddedId = id.toString().padStart(4, '0');
  return `${prefix}/${paddedId}`;
}
