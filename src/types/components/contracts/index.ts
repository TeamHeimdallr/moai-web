import { TOKEN } from '~/types/contracts';

export interface TokenInfo {
  name: string;
  balance: number;
  value: number;
}
export interface Composition {
  name: TOKEN;
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
  lpTokens: number;
  name: string;
  id: string;
}
