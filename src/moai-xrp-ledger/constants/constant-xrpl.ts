import { Amm } from '../types/contracts';

import { CHAIN, IS_MAINNET } from '.';

export const XRPL_JSON_RPC_TEST_NET = 'https://s.devnet.rippletest.net:51234/';
export const XRPL_WSS_TEST_NET = 'wss://s.devnet.rippletest.net:51233/';

export const SCANNER_URL = IS_MAINNET ? '' : 'https://devnet.xrpl.org/';

export const CURRENT_CHAIN = CHAIN;

export const AMM: Record<string, Amm> = {
  rHxWxmYU1AkWFmp3eq2afQ4qrPE7sVqHVr: {
    asset1: {
      currency: 'XRP',
    },
    asset2: {
      currency: 'MOI',
      issuer: 'rKvd5hkFXvPcmLuF2yYFyN6RkgNcnYrjok',
    },
  },
};

export const LIQUIDITY_TOKEN_NAME = {
  XRP_MOI: '50XRP-50MOI',
};

// TODO:
// xrp-moi
export const LIQUIDITY_TOKEN_CURRENCY = '03DECA00BD834D6F16685F645625D144108D4D57';

export const ISSUER = {
  MOI: 'rKvd5hkFXvPcmLuF2yYFyN6RkgNcnYrjok',
  XRP_MOI: 'rHxWxmYU1AkWFmp3eq2afQ4qrPE7sVqHVr',
};
