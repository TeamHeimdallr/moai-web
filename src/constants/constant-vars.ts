import { IS_DEVNET, IS_LOCAL } from '~/constants';

import { IGnbMenu, NETWORK } from '~/types';

export const GNB_MENU: IGnbMenu[] = [
  {
    id: 'pool',
    text: 'Pool',
    path: '/',
    show: true,
    network: [NETWORK.EVM_SIDECHAIN, NETWORK.THE_ROOT_NETWORK, NETWORK.XRPL],
  },
  {
    id: 'swap',
    text: 'Swap',
    path: '/swap',
    show: true,
    network: [NETWORK.EVM_SIDECHAIN, NETWORK.THE_ROOT_NETWORK, NETWORK.XRPL],
  },
  {
    id: 'lending',
    text: 'Lending',
    path: '/lending',
    show: true,
    network: [NETWORK.EVM_SIDECHAIN, NETWORK.THE_ROOT_NETWORK],
  },
  {
    id: 'veMOAI',
    text: 'veMOAI',
    path: '/veMOAI',
    show: false,
    disabled: true,
    commingSoon: true,
    network: [NETWORK.EVM_SIDECHAIN, NETWORK.THE_ROOT_NETWORK],
  },
  {
    id: 'launchpad',
    text: 'Launchpad',
    path: '/launchpad',
    show: false,
    disabled: true,
    commingSoon: true,
    network: [NETWORK.EVM_SIDECHAIN, NETWORK.THE_ROOT_NETWORK],
  },
  {
    id: 'rewards',
    text: 'Rewards',
    path: '/rewards',
    show: true,
    network: [NETWORK.EVM_SIDECHAIN, NETWORK.THE_ROOT_NETWORK],
  },
  {
    id: 'faucet',
    text: 'Faucet',
    path: '/faucet',
    show: IS_LOCAL || IS_DEVNET,
    network: [NETWORK.XRPL, NETWORK.EVM_SIDECHAIN],
  },
];

/**
 * @description FORMAT NUMBER 를 진행할때 UNIT(K,M,B,T) 를 붙이는 기준
 */
export const THOUSAND = 10 ** 3; // 1K
export const MILLION = 10 ** 6; // 1M
export const BILLION = 10 ** 9; // 1B
export const TRILLION = 10 ** 12; // 1T
export const FORMAT_NUMBER_THRESHOLD = MILLION; // 1M

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
