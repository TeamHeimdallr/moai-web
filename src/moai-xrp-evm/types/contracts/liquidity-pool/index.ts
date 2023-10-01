import { Address } from 'viem';

export interface GetLiquidityPoolProvisionsToken {
  name: string;
  balance: number;
  price: number;
  value: number;
}

export interface GetLiquidityPoolProvisions {
  type: 'deposit' | 'withdraw';
  poolId: Address;
  tokens: GetLiquidityPoolProvisionsToken[];
  liquidityProvider: Address;
  time: number;
  txHash: Address;
}
