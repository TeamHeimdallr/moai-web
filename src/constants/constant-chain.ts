import { CHAIN } from '.';
import { CHAIN_LINEA } from './constant-chain-linea';
import { CHAIN_MANTLE } from './constant-chain-mantle';
import { CHAIN_ROOT } from './constant-chain-root';
import { CHAIN_XRPL } from './constant-chain-xrpl';

const integrated = {
  linea: CHAIN_LINEA,
  mantle: CHAIN_MANTLE,
  root: CHAIN_ROOT,
  xrpl: CHAIN_XRPL,
};

const selected = integrated?.[CHAIN as keyof typeof integrated] ?? integrated.xrpl;

export const CHAIN_ID = selected.CHAIN_ID;
export const POOL_ID = selected.POOL_ID;
export const CONTRACT_ADDRESS = selected.CONTRACT_ADDRESS;
export const TOKEN_ADDRESS = selected.TOKEN_ADDRESS;
export const SCANNER_URL = selected.SCANNER_URL;
export const CURRENT_CHAIN = CHAIN;
