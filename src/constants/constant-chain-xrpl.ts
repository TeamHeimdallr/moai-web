import { Address } from 'viem';

import { ChainInfo } from '~/types/constants';

import { IS_MAINNET } from '.';

export const CHAIN_ID = IS_MAINNET ? -1 : -1;

export const POOL_ID: Record<string, Address> = {};

export const CONTRACT_ADDRESS: Record<string, Address> = {};

export const TOKEN_ADDRESS: Record<string, Address> = {};

export const SCANNER_URL = IS_MAINNET ? '' : 'https://explorer.rootnet.cloud';

export const CHAIN_XRPL: ChainInfo = {
  CHAIN_ID,
  POOL_ID,
  CONTRACT_ADDRESS,
  TOKEN_ADDRESS,
  SCANNER_URL,
};

export const XRPL_JSON_RPC_TEST_NET = 'https://amm.devnet.rippletest.net:51234/';
export const XRPL_WSS_TEST_NET = 'wss://amm.devnet.rippletest.net:51233/';
