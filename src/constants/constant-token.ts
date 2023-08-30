import { TokenDAI, TokenMNT, TokenMOAI, TokenUSDC, TokenUSDT, TokenWETH } from '~/assets/images';

export enum TOKEN {
  DAI = 'DAI',
  USDC = 'USDC',
  USDT = 'USDT',
  MNT = 'MNT',
  WETH = 'WETH',
  MOAI = 'MOAI',
}

export const TOKEN_IMAGE_MAPPER: Record<TOKEN, string> = {
  DAI: TokenDAI,
  USDC: TokenUSDC,
  USDT: TokenUSDT,
  MNT: TokenMNT,
  WETH: TokenWETH,
  MOAI: TokenMOAI,
};

// TODO: static token usd
export const TOKEN_USD_MAPPER: Record<TOKEN, number> = {
  DAI: 1,
  USDC: 1,
  USDT: 1,
  MNT: 0.4417,
  WETH: 1718.39,
  MOAI: 142.23,
};
