/**
 * @description 블록체인 환경
 */
export const BLOCKCHAIN_ENV = import.meta.env.VITE_BLOCKCHAIN_ENV;
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

export const XUMM_API_KEY = import.meta.env.VITE_XUMM_API_KEY;
export const XUMM_API_SECRET = import.meta.env.VITE_XUMM_API_SECRET;

export const BASE_URL = IS_MAINNET
  ? 'https://app.moai-finance.xyz'
  : IS_TESTNET
  ? 'https://app-testnet.moai-finance.xyz'
  : IS_DEVNET
  ? 'https://app-devnet.moai-finance.xyz'
  : 'http://localhost:3000';

export const BASE_URL_WITHOUT_HTTPS = IS_MAINNET
  ? 'app.moai-finance.xyz'
  : IS_TESTNET
  ? 'app-testnet.moai-finance.xyz'
  : IS_DEVNET
  ? 'app-devnet.moai-finance.xyz'
  : 'http://localhost:3000';

export const API_URL = IS_MAINNET
  ? 'https://api2.moai-finance.xyz'
  : IS_TESTNET
  ? 'https://api-testnet.moai-finance.xyz'
  : IS_DEVNET
  ? 'https://api-devnet.moai-finance.xyz'
  : 'http://localhost:8080';

const XRPL_BRIDGE_ADDRESS_PORCINI = import.meta.env.VITE_XRPL_BRIDGE_ADDRESS_PORCINI;
const XRPL_BRIDGE_ADDRESS_MAINNET = import.meta.env.VITE_XRPL_BRIDGE_ADDRESS_MAINNET;
export const XRPL_BRIDGE_ADDRESS = IS_MAINNET
  ? XRPL_BRIDGE_ADDRESS_MAINNET
  : XRPL_BRIDGE_ADDRESS_PORCINI;

export const GA_MAINNET = import.meta.env.VITE_GA_MAINNET;
export const GA_DEVNET = import.meta.env.VITE_GA_DEVNET;

export const GTM_MAINNET = import.meta.env.VITE_GTM_MAINNET;
export const GTM_DEVNET = import.meta.env.VITE_GTM_DEVNET;

export const AMPLITUDE_MAINNET = import.meta.env.VITE_AMPLITUDE_MAINNET;
export const AMPLITUDE_DEVNET = import.meta.env.VITE_AMPLITUDE_DEVNET;

export const ENABLE_GA_LOG = import.meta.env.VITE_GA_LOG_ENABLE === 'true';
