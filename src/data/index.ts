import { PoolInfo } from '~/types/components';
import { TOKEN } from '~/types/contracts';

export const pools: PoolInfo[] = [
  {
    compositions: [
      { name: TOKEN.MOAI, weight: 80, balance: 7077.75 },
      { name: TOKEN.WETH, weight: 20, balance: 147 },
    ],
    value: '$1,259,280',
    volume: '$78,086',
    apr: '6.79%',
    lpTokens: 100,
    name: '80MOAI-20WETH',
  },
  {
    compositions: [
      { name: TOKEN.WETH, weight: 50, balance: 147 },
      { name: TOKEN.USDC, weight: 30, balance: 90 },
      { name: TOKEN.USDT, weight: 20, balance: 60 },
    ],
    value: '$10,073,500',
    volume: '$458,137',
    apr: '4.98%',
    lpTokens: 100,
    name: '50WETH-30USDC-20USDT',
  },
];
