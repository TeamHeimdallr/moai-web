import { TOKEN } from '../contracts';

export * from './inputs';
export * from './popups';
export * from './tables';
export * from './tokens';
export * from './tooltips';

export interface PoolInfo {
  compositions: TOKEN[];
  value: string;
  volume: string;
  apr: string;
}
