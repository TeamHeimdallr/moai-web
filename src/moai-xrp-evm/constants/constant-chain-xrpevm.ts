import { Address } from 'viem';

import { ChainInfo } from '~/moai-xrp-evm/types/chain';
import { TOKEN } from '~/moai-xrp-evm/types/contracts';

import { IS_MAINNET } from '.';

export const CHAIN_ID = IS_MAINNET ? 1440002 : 1440002;

export const POOL_ID: Record<string, Address> = {
  WETH_XRP: IS_MAINNET
    ? '0x0'
    : '0xe73749250390c51e029cfab3d0488e08c183a671000200000000000000000001',
};

export const CONTRACT_ADDRESS: Record<string, Address> = {
  VAULT: IS_MAINNET ? '0x0' : '0x1cc5a9f4fd07E97e616F72D829d38c0A6aC5D623',
};

export const TOKEN_ADDRESS: Record<string, Address> = {
  ZERO: IS_MAINNET ? '0x0' : '0x0000000000000000000000000000000000000000',
  [TOKEN.WXRP]: IS_MAINNET ? '0x0' : '0x80dDA4A58Ed8f7E8F992Bbf49efA54aAB618Ab26',
  [TOKEN.XRP]: IS_MAINNET ? '0x0' : '0x80dDA4A58Ed8f7E8F992Bbf49efA54aAB618Ab26',
  [TOKEN.USD]: IS_MAINNET ? '0x0' : '0x64fb75ea8d25beb12ec5d2f2df8569006bb71730',
  [TOKEN.MOAI]: IS_MAINNET ? '0x0' : '0x398f18353094b3976FF0bDe42b2724c47dc66418',
  [TOKEN.WETH]: IS_MAINNET ? '0x0' : '0x2A40A6D0Fb23cf12F550BaFfd54fb82b07a21BDe',
  WETH_XRP: IS_MAINNET ? '0x0' : '0xe73749250390C51e029CfaB3d0488E08C183a671',
};

export const SCANNER_URL = IS_MAINNET ? '' : 'https://evm-sidechain.xrpl.org';

export const CHAIN_XRPEVM: ChainInfo = {
  CHAIN_ID,
  POOL_ID,
  CONTRACT_ADDRESS,
  TOKEN_ADDRESS,
  SCANNER_URL,
};
