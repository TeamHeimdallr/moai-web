export enum TOKEN {
  USDC = 'USDC',
  USDT = 'USDT',
  WETH = 'WETH',
  MOAI = 'MOAI',
}

export interface TokenInfo {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
}
