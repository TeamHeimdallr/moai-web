import { CHAIN, IS_MAINNET } from '.';
import { CHAIN_ID as CHAIN_ID_LINEA } from './constant-chain-linea';
import { POOL_ID as POLL_ID_LINEA } from './constant-chain-linea';
import { CONTRACT_ADDRESS as CONTRACT_ADDRESS_LINEA } from './constant-chain-linea';
import { TOKEN_ADDRESS as TOKEN_ADDRESS_LINEA } from './constant-chain-linea';
import { CHAIN_ID as CHAIN_ID_MANTLE } from './constant-chain-mantle';
import { POOL_ID as POLL_ID_MANTLE } from './constant-chain-mantle';
import { CONTRACT_ADDRESS as CONTRACT_ADDRESS_MANTLE } from './constant-chain-mantle';
import { TOKEN_ADDRESS as TOKEN_ADDRESS_MANTLE } from './constant-chain-mantle';

export const CHAIN_ID =
  CHAIN === 'linea'
    ? IS_MAINNET
      ? CHAIN_ID_LINEA.MAINNET
      : CHAIN_ID_LINEA.TESTNET
    : IS_MAINNET
    ? CHAIN_ID_MANTLE.MAINNET
    : CHAIN_ID_MANTLE.TESTNET;
export const POOL_ID = CHAIN === 'linea' ? POLL_ID_LINEA : POLL_ID_MANTLE;
export const CONTRACT_ADDRESS =
  CHAIN === 'linea' ? CONTRACT_ADDRESS_LINEA : CONTRACT_ADDRESS_MANTLE;
export const TOKEN_ADDRESS = CHAIN === 'linea' ? TOKEN_ADDRESS_LINEA : TOKEN_ADDRESS_MANTLE;

export const CURRENT_CHAIN = CHAIN === 'linea' ? 'Linea' : 'Mantle';
