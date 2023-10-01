import { CHAIN_XRPEVM } from './constant-chain-xrpevm';
import { CHAIN } from '.';

const integrated = {
  xrpevm: CHAIN_XRPEVM,
};

const selected = integrated?.[CHAIN as keyof typeof integrated] ?? integrated.xrpevm;

export const CHAIN_ID = selected.CHAIN_ID;
export const POOL_ID = selected.POOL_ID;
export const CONTRACT_ADDRESS = selected.CONTRACT_ADDRESS;

export const TOKEN_ADDRESS = selected.TOKEN_ADDRESS;
export const SCANNER_URL = selected.SCANNER_URL;

export const CURRENT_CHAIN = CHAIN;
