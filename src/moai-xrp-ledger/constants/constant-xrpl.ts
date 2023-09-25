import { CHAIN, IS_MAINNET } from '.';

export const XRPL_JSON_RPC_TEST_NET = 'https://amm.devnet.rippletest.net:51234/';
export const XRPL_WSS_TEST_NET = 'wss://amm.devnet.rippletest.net:51233/';

export const SCANNER_URL = IS_MAINNET ? '' : 'https://amm-devnet.xrpl.org/';

export const CURRENT_CHAIN = CHAIN;

export const AMM_POOL = {
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
  XRP_MOI: 'XRP-MOI',
};
