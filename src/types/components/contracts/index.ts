import { Address } from 'viem';

export interface TokenInfo {
  name: string;
  balance: number;
  value: number;
}
export interface Composition {
  tokenAddress: Address;
  name: string;
  weight: number;
  balance: number;
  price: number;
}
export interface PoolInfo {
  tokenAddress: string;
  compositions: Composition[];
  value: string;
  valueRaw: number;
  volume: string;
  volumeRaw: number;
  apr: string;
  aprRaw: number;
  fees: string;
  feesRaw: number;
  name: string;
  id: Address;
}
