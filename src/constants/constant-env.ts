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

export const CHAIN = import.meta.env.VITE_CHAIN_ENV;

/**
 * @description WEB3 관련 KEY / RPC PROVIDER ENDPOINT
 */
export const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

export const XRPL_JSON_RPC_TEST_NET = import.meta.env.VITE_XRPL_JSON_RPC_TEST_NET;
export const XRPL_WSS_TEST_NET = import.meta.env.VITE_XRPL_WSS_TEST_NET;
