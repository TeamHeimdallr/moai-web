import { Address } from 'viem';

export interface TokenInfo {
  name: string;
  balance: number;
  value: number;
}
export interface Composition {
  name: string;
  weight: number;
  balance: number;
  price: number;
}
export interface PoolInfo {
  tokenAddress: string;
  compositions: Composition[];
  value: string;
  volume: string;
  apr: string;
  fees: string;
  name: string;
  id: Address;
}
