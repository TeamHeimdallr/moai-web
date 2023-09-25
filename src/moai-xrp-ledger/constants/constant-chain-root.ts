import { Address } from 'viem';

import { ChainInfo } from '~/moai-xrp-root/types/chain';
import { TOKEN } from '~/moai-xrp-root/types/contracts';

import { IS_MAINNET } from '.';

export const CHAIN_ID = IS_MAINNET ? 7668 : 7672;

export const POOL_ID: Record<string, Address> = {
  ROOT_XRP: IS_MAINNET
    ? '0x0'
    : '0x291af6e1b841cad6e3dcd66f2aa0790a007578ad000200000000000000000000',
};

export const CONTRACT_ADDRESS: Record<string, Address> = {
  VAULT: IS_MAINNET ? '0x0' : '0x6548DEA2fB59143215E54595D0157B79aac1335e',
};

export const TOKEN_ADDRESS: Record<string, Address> = {
  [TOKEN.ROOT]: IS_MAINNET ? '0x0' : '0xcCcCCccC00000001000000000000000000000000',
  [TOKEN.XRP]: IS_MAINNET ? '0x0' : '0xCCCCcCCc00000002000000000000000000000000',
  [TOKEN.SYLO]: IS_MAINNET ? '0x0' : '0xCCcCCcCC00000C64000000000000000000000000',
  [TOKEN.ASTO]: IS_MAINNET ? '0x0' : '0xcCcCCccC00004464000000000000000000000000',
  ROOT_XRP: IS_MAINNET ? '0x0' : '0x291af6e1b841cad6e3dcd66f2aa0790a007578ad',
};

export const SCANNER_URL = IS_MAINNET ? '' : 'https://explorer.rootnet.cloud';

export const CHAIN_ROOT: ChainInfo = {
  CHAIN_ID,
  POOL_ID,
  CONTRACT_ADDRESS,
  TOKEN_ADDRESS,
  SCANNER_URL,
};
