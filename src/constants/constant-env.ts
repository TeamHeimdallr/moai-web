/**
 * @description 블록체인 환경
 */
export const IS_MAINNET2 = import.meta.env.VITE_IS_MAIN2 === 'true';

export const IS_MAINNET = import.meta.env.VITE_BLOCKCHAIN_ENV === 'mainnet';
export const IS_TESTNET = import.meta.env.VITE_BLOCKCHAIN_ENV === 'testnet';
export const IS_DEVNET = import.meta.env.VITE_BLOCKCHAIN_ENV === 'devnet';
export const IS_LOCAL = import.meta.env.VITE_BLOCKCHAIN_ENV === 'local';

export const CHAIN = import.meta.env.VITE_CHAIN_ENV;

/**
 * @description 랜딩페이지 여부
 */
export const IS_LANDING = import.meta.env.VITE_IS_LANDING === 'true';

/**
 * @description WEB3 관련 KEY / RPC PROVIDER ENDPOINT
 */
export const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

export const BASE_URL = IS_MAINNET
  ? IS_MAINNET2
    ? 'https://app-mainnet.moai-finance.xyz'
    : 'https://app.moai-finance.xyz'
  : IS_TESTNET
  ? 'https://app-testnet.moai-finance.xyz'
  : IS_DEVNET
  ? 'https://app-devnet.moai-finance.xyz'
  : 'http://localhost:3000';

export const API_URL = IS_MAINNET
  ? IS_MAINNET2
    ? 'https://api2.moai-finance.xyz'
    : 'https://api.moai-finance.xyz'
  : IS_TESTNET
  ? 'https://api-testnet.moai-finance.xyz'
  : IS_DEVNET
  ? 'https://api-devnet.moai-finance.xyz'
  : 'http://localhost:8080';
