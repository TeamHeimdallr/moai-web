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
}
export interface PoolInfo {
  compositions: Composition[];
  value: string;
  volume: string;
  apr: string;
  lpTokens: number;
  name: string;
}
