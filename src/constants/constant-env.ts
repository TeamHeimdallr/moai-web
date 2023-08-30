import { Address } from 'viem';

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

export const ALCHEMY_POLYGON_MUMBAI_API_KEY = import.meta.env.VITE_ALCHEMY_POLYGON_MUMBAI_API_KEY;
export const ALCHEMY_POLYGON_MUMBAI_API = 'https://polygon-mumbai.g.alchemy.com';

export const POLYGONSCAN_POLYGON_MUMBAI_API_KEY = import.meta.env
  .VITE_POLYGONSCAN_POLYGON_MUMBAI_API_KEY;
export const POLYGONSCAN_POLYGON_MUMBAI_API = 'https://api-testnet.polygonscan.com';

/**
 * @description CHAIN ID / CONTRACT ADDRESS
 */
type Chain = 'ETH' | 'GOERLI';
type Contract = 'CONTRACT_NAME';

export const CHAIN_ID: Record<Chain, number> = {
  ETH: 1,
  GOERLI: 5,
};
export const CONTRACT_ADDRESS: Record<Contract, Address> = {
  CONTRACT_NAME: IS_MAINNET ? '0x' : '0x',
};
export const DEFAULT_CHAIN_ID = IS_MAINNET ? CHAIN_ID.ETH : CHAIN_ID.GOERLI;

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
export const FORMAT_NUMBER_THRESHOLD = 10000000;
