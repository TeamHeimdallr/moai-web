import { CHAIN_ROOT } from './constant-chain-root';
import { CHAIN } from '.';

const integrated = {
  root: CHAIN_ROOT,
};

const selected = integrated?.[CHAIN as keyof typeof integrated] ?? integrated.root;

export const CHAIN_ID = selected.CHAIN_ID;
export const POOL_ID = selected.POOL_ID;
export const CONTRACT_ADDRESS = selected.CONTRACT_ADDRESS;

export const TOKEN_ADDRESS = selected.TOKEN_ADDRESS;
export const SCANNER_URL = selected.SCANNER_URL;

export const CURRENT_CHAIN = CHAIN;

export const XRPL_JSON_RPC_TEST_NET = 'https://amm.devnet.rippletest.net:51234/';
export const XRPL_WSS_TEST_NET = 'wss://amm.devnet.rippletest.net:51233/';
