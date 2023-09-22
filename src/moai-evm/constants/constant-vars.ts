import { TokenMOAI, TokenWETH } from '~/assets/images';

import { GnbMenu } from '~/types';
export const TOKEN_DECIAML = 18;
export const TOKEN_IMAGE_MAPPER: Record<string, string> = {
  MOAI: TokenMOAI,
  WETH: TokenWETH,

  '80MOAI-20WETH': TokenMOAI,
};

export const TOKEN_USD_MAPPER: Record<string, number> = {
  WETH: 1718.39,
  MOAI: 142.23,
};

export const TOKEN_DESCRIPTION_MAPPER: Record<string, string> = {
  WETH: 'WETH',
  MOAI: 'MOAI Finance Token',
  '80MOAI-20WETH': '80MOAI-20WETH LP Token',
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
