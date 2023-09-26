import { Amm } from '../types/contracts';

import { CHAIN, IS_MAINNET } from '.';

export const XRPL_JSON_RPC_TEST_NET = 'https://amm.devnet.rippletest.net:51234/';
export const XRPL_WSS_TEST_NET = 'wss://amm.devnet.rippletest.net:51233/';

export const SCANNER_URL = IS_MAINNET ? '' : 'https://amm-devnet.xrpl.org/';

export const CURRENT_CHAIN = CHAIN;

export const POOL_ID = {
  XRP_MOI: 'XRP_MOI',
};

export const AMM: Record<string, Amm> = {
  XRP_MOI: {
    asset1: {
      currency: 'XRP',
    },
    asset2: {
      currency: 'MOI',
      issuer: 'rPEQacsbfGADDHb6wShzTZ2ajByQFPdY3E',
    },
  },
};

export const LIQUIDITY_TOKEN_NAME = {
  XRP_MOI: '50XRP-50MOI',
};

export const ISSUER = {
  MOI: 'rPEQacsbfGADDHb6wShzTZ2ajByQFPdY3E',
  XRP_MOI: 'r3k73UkdrvPxCHaw9nwG2CzQ2W5esgZXCv',
};
