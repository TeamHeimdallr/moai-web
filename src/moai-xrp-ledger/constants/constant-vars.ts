import { TokenMOAI, TokenXRP } from '~/assets/images';

import { GnbMenu } from '~/types';

import { CHAIN, IS_MAINNET } from '.';

export const TOKEN_DECIAML = 6;
export const TOKEN_IMAGE_MAPPER: Record<string, string> = {
  MOAI: TokenMOAI,
  XRP: TokenXRP,
  '50MOAI-50XRP': TokenXRP,
};

export const TOKEN_USD_MAPPER: Record<string, number> = {
  MOAI: 10.23,
  XRP: 0.5,
};

export const TOKEN_DESCRIPTION_MAPPER: Record<string, string> = {
  MOAI: 'MOAI Finance Token',
  XRP: 'XRP',
  '50MOAI-50XRP': '50MOAI-50XRP LP Token',
};

export const GNB_MENU: GnbMenu[] = [
  {
    id: 'pool',
    text: 'Pool',
    path: '/',
  },
  {
    id: 'swap',
    text: 'Swap',
    path: '/swap',
  },
  {
    id: 'launchpad',
    text: 'Launchpad',
    path: '/',
    disabled: true,
    commingSoon: true,
  },
  {
    id: 'rewards',
    text: 'Rewards',
    path: '/',
    disabled: true,
    commingSoon: true,
  },
];

export const XRPL_JSON_RPC_TEST_NET = 'https://amm.devnet.rippletest.net:51234/';
export const XRPL_WSS_TEST_NET = 'wss://amm.devnet.rippletest.net:51233/';

export const SCANNER_URL = IS_MAINNET ? '' : 'https://explorer.rootnet.cloud';

export const CURRENT_CHAIN = CHAIN;
