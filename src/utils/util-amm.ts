import { hexToString } from 'viem';
import { AMMInfoResponse, Amount, Currency, dropsToXrp, xrpToDrops } from 'xrpl';

import { IToken } from '~/types';

export const tokenToAmmAsset = (token?: IToken): Currency => {
  if (!token)
    return {
      currency: '',
      issuer: '',
    };

  if (token.symbol === 'XRP') return { currency: 'XRP' };
  return {
    currency: token.currency,
    issuer: token.address,
  };
};

export const formatAmountToNumber = (
  amount: Amount,
  type: 'dropToXrp' | 'xrpToDrop' = 'xrpToDrop'
): number => {
  if (typeof amount === 'string')
    return Number(type === 'dropToXrp' ? dropsToXrp(amount) : xrpToDrops(amount));
  return Number(amount.value);
};

export const formatAmountToNumberFromToken = (
  token?: IToken,
  amm?: AMMInfoResponse['result']['amm']
): number => {
  if (!token || !amm) return 0;

  if (token.symbol === 'XRP') {
    if (typeof amm.amount === 'string') return Number(dropsToXrp(amm.amount));
    if (typeof amm.amount2 === 'string') return Number(dropsToXrp(amm.amount2));
    return 0;
  }

  if (typeof amm.amount === 'object' && token.currency === amm.amount.currency)
    return Number(amm.amount.value);
  if (typeof amm.amount2 === 'object' && token.currency === amm.amount2.currency)
    return Number(amm.amount2.value);
  return 0;
};

export const formatCurrency = (currency?: string) => {
  return hexToString(('0x' + (currency || '')) as `0x${string}`, { size: 40 });
};
