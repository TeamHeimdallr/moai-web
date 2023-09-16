import { Address } from 'viem';

import { ChainInfo } from '~/types/constants';
import { TOKEN } from '~/types/contracts';

import { IS_MAINNET } from '.';

export const CHAIN_ID = IS_MAINNET ? 59144 : 59140;

export const POOL_ID: Record<string, Address> = {
  POOL_A: IS_MAINNET ? '0x' : '0x7668298663e13a51146208f2c02d95c8ea3ae9c8000200000000000000000001',
  POOL_B: IS_MAINNET ? '0x' : '0x351459932123c1986846964a264eced41c50eb48000100000000000000000002',
};

export const CONTRACT_ADDRESS: Record<string, Address> = {
  VAULT: IS_MAINNET ? '0x' : '0xf8bc9D8d864bD35b0FC51eF832c4104d17Ad185b',
};

export const TOKEN_ADDRESS: Record<string, Address> = {
  [TOKEN.MOAI]: IS_MAINNET ? '0x' : '0xa3c9316E88123cC6BF9749b197EE49Bb6fa1d94F',
  [TOKEN.WETH]: IS_MAINNET ? '0x' : '0x93e27D1750C7bbd6016EE0C86E72997c6c61eB44',
  [TOKEN.USDC]: IS_MAINNET ? '0x' : '0xB4d456ae41894b0F03e31f4e3A344B5F9b058058',
  [TOKEN.USDT]: IS_MAINNET ? '0x' : '0x115c215066814b1D24e30518d20B5f0d73856147',
  [TOKEN.ROOT]: IS_MAINNET ? '0x' : '0x',
  [TOKEN.XRP]: IS_MAINNET ? '0x' : '0xCCCCcCCc00000002000000000000000000000000',
  POOL_A: IS_MAINNET ? '0x' : '0x7668298663e13a51146208f2c02d95c8ea3ae9c8',
  POOL_B: IS_MAINNET ? '0x' : '0x351459932123c1986846964a264eced41c50eb48',
};

export const SCANNER_URL = IS_MAINNET ? '' : 'https://goerli.lineascan.build';

export const CHAIN_LINEA: ChainInfo = {
  CHAIN_ID,
  POOL_ID,
  CONTRACT_ADDRESS,
  TOKEN_ADDRESS,
  SCANNER_URL,
};
