import { TokenMOAI, TokenROOT, TokenWETH, TokenXRP } from '~/assets/images';

import { GnbMenu } from '~/types';

export const TOKEN_DECIAML = 18;
export const TOKEN_IMAGE_MAPPER: Record<string, string> = {
  WETH: TokenWETH,
  MOAI: TokenMOAI,
  XRP: TokenXRP,
  WXRP: TokenXRP,
  '50WETH-50XRP': TokenXRP, // TODO
  '50WETH-50WXRP': TokenXRP, // TODO
  '50ROOT-50XRP': TokenROOT,
};

export const TOKEN_USD_MAPPER: Record<string, number> = {
  MOAI: 10.23,
  XRP: 0.5,
  WXRP: 0.5,
  WETH: 1718.39,
};

export const TOKEN_DESCRIPTION_MAPPER: Record<string, string> = {
  WETH: 'Wrapped Ether',
  MOAI: 'MOAI Finance Token',
  ROOT: 'The Root Network',
  XRP: 'XRP',
  WXRP: 'Wrapped XRP',
  '50ROOT-40XRP': '50ROOT-50XRP LP Token',
  '50WETH-50XRP': '50WETH-50XRP LP Token',
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
