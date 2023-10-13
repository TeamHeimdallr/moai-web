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
export const IS_TESTNET = import.meta.env.VITE_BLOCKCHAIN_ENV === 'testnet';
export const IS_DEVNET = import.meta.env.VITE_BLOCKCHAIN_ENV === 'devnet';

export const CHAIN = import.meta.env.VITE_CHAIN_ENV;

/**
 * @description WEB3 관련 KEY / RPC PROVIDER ENDPOINT
 */
export const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

export const BASE_URL = IS_PROD
  ? 'https://app.moai-finance.xyz'
  : IS_STAGING
  ? 'https://app-testnet.moai-finance.xyz'
  : IS_DEV
  ? 'https://app-devnet.moai-finance.xyz'
  : 'http://localhost:3000';
