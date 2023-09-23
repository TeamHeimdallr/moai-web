import { TokenMOAI, TokenROOT } from '~/assets/images';

import { GnbMenu } from '~/types';

export const TOKEN_DECIAML = 6;
export const TOKEN_IMAGE_MAPPER: Record<string, string> = {
  MOAI: TokenMOAI,
  ROOT: TokenROOT,
  '50ROOT-50XRP': TokenROOT,
};

export const TOKEN_USD_MAPPER: Record<string, number> = {
  MOAI: 10.23,
  XRP: 0.5,
};

export const TOKEN_DESCRIPTION_MAPPER: Record<string, string> = {
  ROOT: 'The Root Network',
  XRP: 'XRP',
  '50ROOT-40XRP': '50ROOT-50XRP LP Token',
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
