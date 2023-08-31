import { PoolInfo } from '~/types/components';
import { TOKEN } from '~/types/contracts';

export const pools: PoolInfo[] = [
  { compositions: [TOKEN.MOAI, TOKEN.WETH], value: '$1,259,280', volume: '$78,086', apr: '6.79%' },
  {
    compositions: [TOKEN.WETH, TOKEN.USDC, TOKEN.USDT],
    value: '$10,073,500',
    volume: '$458,137',
    apr: '4.98%',
  },
];
