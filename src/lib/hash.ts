/** 32-bit FNV-1a hash, handy for stable keys and per-item seeds. */
export const hashString = (text: string) => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};
