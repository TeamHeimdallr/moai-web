export interface TokenInfo {
  name: string;
  balance: number;
  price: number;
  value: number;
}

export interface Composition extends TokenInfo {
  // pool token
  tokenIssuer?: string;
  weight: number;
}

export interface PoolInfo {
  account: string;

  // lp token
  tokenName: string;
  tokenIssuer: string;
  tokenTotalSupply: number;

  compositions: Composition[];

  formattedBalance: string;
  formattedValue: string;
  formattedVolume: string;
  formattedApr: string;
  formattedFees: string;

  balance: number;
  value: number;
  volume: number;
  apr: number;
  fees: number;
}

export interface GetLiquidityPoolProvisionsToken {
  name: string;
  balance: number;
  price: number;
  value: number;
}

export interface GetLiquidityPoolProvisions {
  type: 'deposit' | 'withdraw';
  account: string;
  tokens: GetLiquidityPoolProvisionsToken[];
  liquidityProvider: string;
  time: number;
  txHash: string;
}
