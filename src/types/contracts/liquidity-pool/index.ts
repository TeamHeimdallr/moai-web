import { Address } from 'viem';

export interface GetLiquidityPoolProvisionsToken {
  address: Address;
  symbol: string;
  amount: string;
}

export interface GetLiquidityPoolProvisions {
  type: 'deposit' | 'withdraw';
  poolId: Address;
  tokens: GetLiquidityPoolProvisionsToken[];
  timestamp: number;
  my: boolean;
}
