import { IGnbMenu } from '~/types';

import { IS_MAINNET, IS_MAINNET2 } from '.';

// TODO: remove this when mainnet2 is ready
const gnbSwapDisabled = IS_MAINNET && !IS_MAINNET2;
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
    disabled: gnbSwapDisabled,
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
    path: '/rewards',
    disabled: true,
    commingSoon: true,
  },
];

/**
 * @description FORMAT NUMBER 를 진행할때 UNIT(K,M,B,T) 를 붙이는 기준
 */
export const FORMAT_NUMBER_THRESHOLD = 10 ** 10;

/**
 * @description RESPONSIVE BREAKPOINT
 */
export const BREAKPOINT = {
  XS: 0,
  SM: 360,
  SMD: 640,
  MD: 820,
  MLG: 960,
  LG: 1120,
  XL: 1320,
  XXL: 1440,

  MEDIA_XS: '(min-width: 0px)',
  MEDIA_SM: '(min-width: 360px)',
  MEDIA_SMD: '(min-width: 640px)',
  MEDIA_MD: '(min-width: 820px)',
  MEDIA_MLG: '(min-width: 960px)',
  MEDIA_LG: '(min-width: 1120px)',
  MEDIA_XL: '(min-width: 1320px)',
  MEDIA_XXL: '(min-width: 1440px)',
};

export const ASSET_URL = 'https://assets.moai-finance.xyz';
