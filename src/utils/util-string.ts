import * as crypto from 'crypto';
import { UID_HASHING_KEY } from '~/constants';

export const truncateAddress = (addr?: string, limit = 4) => {
  if (!addr) return '';

  const zerox = addr.slice(0, 2) === '0x' ? 2 : 0;
  return addr.slice(0, zerox + limit) + '...' + addr.slice(-limit, addr.length);
};

export const formatComma = (value: string) => {
  const plainValue = value.replace(/[^\d.]/g, '');

  let parts = plainValue.split('.');
  if (parts.length > 1) {
    parts = [parts[0], parts[1]];
  }

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

export const parseComma = (value: string) => value?.replace(/,/g, '');

export const hashing = (input: string, key: string) => {
  return crypto.createHmac('sha256', key).update(input).digest('hex').slice(0, 16);
};

export const getUid = (address: string) => {
  return hashing(address, UID_HASHING_KEY);
};
