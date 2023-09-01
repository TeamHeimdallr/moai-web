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
  compositions: Composition[];
  value: string;
  volume: string;
  apy: string;
  fees: string;
  lpTokens: number;
  name: string;
}
