import {
  imageTokenMOAI,
  imageTokenROOT,
  imageTokenUSDC,
  imageTokenUSDT,
  imageTokenWETH,
  imageTokenXRP,
} from '~/assets/images';

import { IGnbMenu } from '~/types';

export const TOKEN_IMAGE_MAPPER: Record<string, string> = {
  MOAI: imageTokenMOAI,
  MOI: imageTokenMOAI,

  ROOT: imageTokenROOT,

  WETH: imageTokenWETH,
  USDC: imageTokenUSDC,
  USDT: imageTokenUSDT,

  XRP: imageTokenXRP,
  WXRP: imageTokenXRP,
};

export const GNB_MENU: IGnbMenu[] = [
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
