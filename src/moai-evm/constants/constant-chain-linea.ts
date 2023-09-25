import { Address } from 'viem';

import { ChainInfo } from '~/moai-evm/types/chain';
import { TOKEN } from '~/moai-evm/types/contracts';

import { IS_MAINNET } from '.';

const CHAIN_ID = IS_MAINNET ? 59144 : 59140;

const POOL_ID: Record<string, Address> = {
  MOAI_WETH: IS_MAINNET
    ? '0x0'
    : '0x7668298663e13a51146208f2c02d95c8ea3ae9c8000200000000000000000001',
};

const CONTRACT_ADDRESS: Record<string, Address> = {
  VAULT: IS_MAINNET ? '0x0' : '0xf8bc9D8d864bD35b0FC51eF832c4104d17Ad185b',
};

const TOKEN_ADDRESS: Record<string, Address> = {
  [TOKEN.MOAI]: IS_MAINNET ? '0x0' : '0xa3c9316E88123cC6BF9749b197EE49Bb6fa1d94F',
  [TOKEN.WETH]: IS_MAINNET ? '0x0' : '0x93e27D1750C7bbd6016EE0C86E72997c6c61eB44',
  MOAI_WETH: IS_MAINNET ? '0x0' : '0x7668298663e13a51146208f2c02d95c8ea3ae9c8',
};

const SCANNER_URL = IS_MAINNET ? '' : 'https://goerli.lineascan.build';

export const CHAIN_LINEA: ChainInfo = {
  CHAIN_ID,
  POOL_ID,
  CONTRACT_ADDRESS,
  TOKEN_ADDRESS,
  SCANNER_URL,
};
