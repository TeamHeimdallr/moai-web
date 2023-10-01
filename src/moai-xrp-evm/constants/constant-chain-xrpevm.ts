import { Address } from 'viem';

import { ChainInfo } from '~/moai-xrp-evm/types/chain';
import { TOKEN } from '~/moai-xrp-evm/types/contracts';

import { IS_MAINNET } from '.';

export const CHAIN_ID = IS_MAINNET ? 1440002 : 1440002;

export const POOL_ID: Record<string, Address> = {
  WETH_XRP: IS_MAINNET
    ? '0x0'
    : '0xff2973a6a98583ef12927f4a7eef497a48d1fabe000200000000000000000003',
};

export const CONTRACT_ADDRESS: Record<string, Address> = {
  VAULT: IS_MAINNET ? '0x0' : '0x0304b0D38077ea98bC4f73BDba83b880bcDd97CC',
};

export const TOKEN_ADDRESS: Record<string, Address> = {
  [TOKEN.WXRP]: IS_MAINNET ? '0x0' : '0x80dDA4A58Ed8f7E8F992Bbf49efA54aAB618Ab26',
  [TOKEN.USD]: IS_MAINNET ? '0x0' : '0x64fb75ea8d25beb12ec5d2f2df8569006bb71730',
  [TOKEN.MOAI]: IS_MAINNET ? '0x0' : '0x398f18353094b3976FF0bDe42b2724c47dc66418',
  [TOKEN.WETH]: IS_MAINNET ? '0x0' : '0x2A40A6D0Fb23cf12F550BaFfd54fb82b07a21BDe',
  WETH_XRP: IS_MAINNET ? '0x0' : '0xff2973a6a98583eF12927f4A7eef497a48d1FABE',
};

export const SCANNER_URL = IS_MAINNET ? '' : 'https://evm-sidechain.xrpl.org';

export const CHAIN_XRPEVM: ChainInfo = {
  CHAIN_ID,
  POOL_ID,
  CONTRACT_ADDRESS,
  TOKEN_ADDRESS,
  SCANNER_URL,
};
