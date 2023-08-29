export const truncateAddress = (addr?: `0x${string}`, limit = 4) => {
  if (!addr) return '';

  const zerox = addr.slice(0, 2) == '0x' ? 2 : 0;
  return addr.slice(0, zerox + limit) + '...' + addr.slice(-limit, addr.length);
};
