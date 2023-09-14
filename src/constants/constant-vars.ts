import { TokenMOAI, TokenUSDC, TokenUSDT, TokenWETH } from '~/assets/images';
import { GnbMenu } from '~/types/components/gnb';
import { TOKEN } from '~/types/contracts';

import { CHAIN } from '.';

export const TOKEN_IMAGE_MAPPER: Record<TOKEN, string> = {
  USDC: TokenUSDC,
  USDT: TokenUSDT,
  WETH: TokenWETH,
  MOAI: TokenMOAI,
};

// TODO: static token usd
export const TOKEN_USD_MAPPER: Record<TOKEN, number> = {
  USDC: 1,
  USDT: 1,
  WETH: 1718.39,
  MOAI: 142.23,
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

/**
 * @description FORMAT NUMBER 를 진행할때 UNIT(K,M,B,T) 를 붙이는 기준
 */
export const FORMAT_NUMBER_THRESHOLD = 1000000000;

/**
 * @description RESPONSIVE BREAKPOINT
 */
export const BREAKPOINT = {
  SM: 0,
  MD: 848,
  LG: 1280,

  MEDIA_SM: '(min-width: 0px)',
  MEDIA_MD: '(min-width: 848px)',
  MEDIA_LG: '(min-width: 1280px)',
};
