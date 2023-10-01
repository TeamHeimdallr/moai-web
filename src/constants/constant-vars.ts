import { TokenMOAI, TokenROOT, TokenWETH, TokenXRP } from '~/assets/images';

import { GnbMenu } from '~/types';

export enum TOKEN {
  MOAI = 'MOAI',
  WETH = 'WETH',
  ROOT = 'ROOT',
  XRP = 'XRP',
  WXRP = 'WXRP',
  MOI = 'MOI',
}

export const TOKEN_IMAGE_MAPPER: Record<string, string> = {
  MOAI: TokenMOAI,
  MOI: TokenMOAI,
  WETH: TokenWETH,
  ROOT: TokenROOT,
  XRP: TokenXRP,
  WXRP: TokenXRP,

  '50WETH-50XRP': TokenXRP, // TODO
  '80MOAI-20WETH': TokenMOAI,
  '50ROOT-50XRP': TokenROOT,
  '50XRP-50MOI': TokenXRP,
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
