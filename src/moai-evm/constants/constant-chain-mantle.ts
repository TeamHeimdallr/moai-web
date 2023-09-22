import { Address } from 'viem';

import { ChainInfo } from '~/moai-evm/types/chain';
import { TOKEN } from '~/moai-evm/types/contracts';

import { IS_MAINNET } from '.';

const CHAIN_ID = IS_MAINNET ? 5000 : 5001;

const POOL_ID: Record<string, Address> = {
  MOAI_WETH: IS_MAINNET
    ? '0x0'
    : '0x7e6acf4545f676d250f856a8b10f67f6244c1912000200000000000000000001',
};

const CONTRACT_ADDRESS: Record<string, Address> = {
  VAULT: IS_MAINNET ? '0x0' : '0xB4d456ae41894b0F03e31f4e3A344B5F9b058058',
};

const TOKEN_ADDRESS: Record<string, Address> = {
  [TOKEN.MOAI]: IS_MAINNET ? '0x0' : '0xaf5F3781678a0Bd4258cB4e9885b26E6629b7930',
  [TOKEN.WETH]: IS_MAINNET ? '0x0' : '0xd1A5c7Dd009e578bf4aC8f9392D1fFdbC27B86BB',
  MOAI_WETH: IS_MAINNET ? '0x0' : '0x7E6AcF4545F676d250F856A8b10f67f6244C1912',
};

const SCANNER_URL = IS_MAINNET ? '' : 'https://explorer.testnet.mantle.xyz';

export const CHAIN_MANTLE: ChainInfo = {
  CHAIN_ID,
  POOL_ID,
  CONTRACT_ADDRESS,
  TOKEN_ADDRESS,
  SCANNER_URL,
};
