import { Address } from 'viem';

import { TOKEN } from '~/types/contracts';

import { IS_MAINNET } from '.';

export const CHAIN_ID: Record<'MAINNET' | 'TESTNET', number> = {
  MAINNET: 5000,
  TESTNET: 5001,
};

export const POOL_ID: Record<string, string> = {
  POOL_A: IS_MAINNET ? '0x' : '0x7e6acf4545f676d250f856a8b10f67f6244c1912000200000000000000000001',
  POOL_B: IS_MAINNET ? '0x' : '0xd9d0b686d77c1f33902bcfee5522332b96decb38000100000000000000000002',
};

export const CONTRACT_ADDRESS: Record<'VAULT', Address> = {
  VAULT: IS_MAINNET ? '0x' : '0xB4d456ae41894b0F03e31f4e3A344B5F9b058058',
};

export const TOKEN_ADDRESS: Record<TOKEN | 'POOL_A' | 'POOL_B', Address> = {
  [TOKEN.MOAI]: IS_MAINNET ? '0x' : '0xaf5F3781678a0Bd4258cB4e9885b26E6629b7930',
  [TOKEN.WETH]: IS_MAINNET ? '0x' : '0xd1A5c7Dd009e578bf4aC8f9392D1fFdbC27B86BB',
  [TOKEN.USDC]: IS_MAINNET ? '0x' : '0xcBdaCEaE8660BE805Deaf36A210c770989Ed4888',
  [TOKEN.USDT]: IS_MAINNET ? '0x' : '0xF01C2F30D8e7DCa8D589B66B4cC5214c8Eb993E4',
  POOL_A: IS_MAINNET ? '0x' : '0x7E6AcF4545F676d250F856A8b10f67f6244C1912',
  POOL_B: IS_MAINNET ? '0x' : '0xd9D0B686D77c1F33902bCfEe5522332B96DECb38',
};
