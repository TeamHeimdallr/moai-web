export const truncateAddress = (addr?: string, limit = 4) => {
  if (!addr) return '';

  const zerox = addr.slice(0, 2) == '0x0' ? 2 : 0;
  return addr.slice(0, zerox + limit) + '...' + addr.slice(-limit, addr.length);
};

export const truncateXrplAddress = (addr?: string, limit = 4) => {
  if (!addr) return '';

  return addr.slice(0, limit) + '...' + addr.slice(-limit, addr.length);
};
