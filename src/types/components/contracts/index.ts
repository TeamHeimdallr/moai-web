import { TOKEN } from '~/types/contracts';

export interface TokenInfo {
  name: string;
  balance: number;
  value: number;
}
export interface PoolInfo {
  compositions: TOKEN[];
  value: string;
  volume: string;
  apr: string;
}
