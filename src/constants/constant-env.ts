import { Address } from 'viem';

import { TOKEN } from '~/types/contracts';

/**
 * @description 서버 START ENV / MOCK 환경
 */
export const IS_MOCK = import.meta.env.VITE_ENABLE_MOCK === 'true';
export const IS_LOCAL = import.meta.env.VITE_START_ENV === 'local';
export const IS_DEV = import.meta.env.VITE_START_ENV === 'dev';
export const IS_STAGING = import.meta.env.VITE_START_ENV === 'staging';
export const IS_PROD = import.meta.env.VITE_START_ENV === 'prod';

export const DEV_ENV = IS_MOCK || IS_LOCAL || IS_DEV;
export const PROD_ENV = IS_PROD || IS_STAGING;

/**
 * @description 블록체인 환경
 */
export const IS_MAINNET = import.meta.env.VITE_BLOCKCHAIN_ENV === 'mainnet';

/**
 * @description BE API ENDPOINT / FE BASE URL // ASSET URL
 */
export const API_URL = IS_PROD ? '' : IS_STAGING ? '' : IS_DEV ? '' : 'http://localhost:8080';
export const BASE_URL = IS_PROD ? '' : IS_STAGING ? '' : IS_DEV ? '' : 'http://localhost:3000';
export const ASSET_URL = '';

/**
 * @description WEB3 관련 KEY / RPC PROVIDER ENDPOINT
 */
export const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

export const PROVIDER_WSS_ENDPOINT = import.meta.env.VITE_PROVIDER_WSS_ENDPOINT;
export const PROVIDER_HTTP_ENDPOINT = import.meta.env.VITE_PROVIDER_HTTP_ENDPOINT;

export const ALCHEMY_ETHEREUM_GOERLI_API_KEY = import.meta.env.VITE_ALCHEMY_ETHEREUM_GOERLI_API_KEY;
export const ALCHEMY_ETHEREUM_GOERLI_API = 'https://eth-goerli.g.alchemy.com';

/**
 * @description CHAIN ID / CONTRACT ADDRESS
 */
type Chain = 'MANTLE' | 'MANTLE_TESTNET';
type Contract = 'CONTRACT_NAME' | 'VAULT';

export const CHAIN_ID: Record<Chain, number> = {
  MANTLE: 5000,
  MANTLE_TESTNET: 5001,
};

export const POOL_ID: Record<'POOL_A' | 'POOL_B', string> = {
  POOL_A: IS_MAINNET ? '0x' : '0x7e6acf4545f676d250f856a8b10f67f6244c1912000200000000000000000001',
  POOL_B: IS_MAINNET ? '0x' : '0x',
};

export const CONTRACT_ADDRESS: Record<Contract, Address> = {
  CONTRACT_NAME: IS_MAINNET ? '0x' : '0x',
  VAULT: IS_MAINNET ? '0x' : '0xB4d456ae41894b0F03e31f4e3A344B5F9b058058',
};

export const TOKEN_ADDRESS: Record<TOKEN | 'POOL_A' | 'POOL_B', Address> = {
  [TOKEN.MOAI]: IS_MAINNET ? '0x' : '0xaf5F3781678a0Bd4258cB4e9885b26E6629b7930',
  [TOKEN.WETH]: IS_MAINNET ? '0x' : '0xd1A5c7Dd009e578bf4aC8f9392D1fFdbC27B86BB',
  [TOKEN.USDC]: IS_MAINNET ? '0x' : '0xcBdaCEaE8660BE805Deaf36A210c770989Ed4888',
  [TOKEN.USDT]: IS_MAINNET ? '0x' : '0xF01C2F30D8e7DCa8D589B66B4cC5214c8Eb993E4',
  POOL_A: IS_MAINNET ? '0x' : '0x7E6AcF4545F676d250F856A8b10f67f6244C1912',
  POOL_B: IS_MAINNET ? '0x' : '0x',
};

export const DEFAULT_CHAIN_ID = IS_MAINNET ? CHAIN_ID.MANTLE : CHAIN_ID.MANTLE_TESTNET;
export const MANTLE_CHAIN_ID = IS_MAINNET ? CHAIN_ID.MANTLE : CHAIN_ID.MANTLE_TESTNET;

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

/**
 * @description FORMAT NUMBER 를 진행할때 UNIT(K,M,B,T) 를 붙이는 기준
 */
export const FORMAT_NUMBER_THRESHOLD = 1000000000;
