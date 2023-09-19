import {
  ChainROOT,
  ChainXRPL,
  TokenMOAI,
  TokenROOT,
  TokenUSDC,
  TokenUSDT,
  TokenWETH,
  TokenXRPL,
} from '~/assets/images';
import { ChainSelect, GnbMenu } from '~/types/components/gnb';

import { CHAIN_ID as ROOT_CHAIN_ID } from './constant-chain-root';
import { CHAIN_ID as XRPL_CHAIN_ID } from './constant-chain-xrpl';

export const TOKEN_IMAGE_MAPPER: Record<string, string> = {
  USDC: TokenUSDC,
  USDT: TokenUSDT,
  WETH: TokenWETH,
  MOAI: TokenMOAI,
  ROOT: TokenROOT,
  XRP: TokenXRPL,
  '80MOAI-20WETH': TokenMOAI,
};

export const TOKEN_USD_MAPPER: Record<string, number> = {
  USDC: 1,
  USDT: 1,
  WETH: 1718.39,
  MOAI: 142.23,
  ROOT: 0.0141,
  XRP: 0.5,
};

export const CHAIN_IMAGE_MAPPER: Record<number, string> = {
  [XRPL_CHAIN_ID]: ChainXRPL,
  [ROOT_CHAIN_ID]: ChainROOT,
};

export const TOKEN_DESCRIPTION_MAPPER: Record<string, string> = {
  USDC: 'USD Coin',
  USDT: 'Tether USDt',
  WETH: 'WETH',
  MOAI: 'MOAI Finance Token',
  ROOT: 'The Root Network',
  XRP: 'Ripple Ledger',
  '80MOAI-20WETH': '80MOAI-20WETH',
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

export const CHAIN_SELECT_LIST: ChainSelect[] = [
  {
    id: ROOT_CHAIN_ID,
    text: 'The Root Network',
  },
  {
    id: XRPL_CHAIN_ID,
    text: 'XRPL',
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
