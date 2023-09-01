import { TOKEN_USD_MAPPER } from '~/constants';
import { PoolInfo } from '~/types/components';
import { TOKEN } from '~/types/contracts';

export const pools: PoolInfo[] = [
  {
    compositions: [
      { name: TOKEN.MOAI, weight: 80, balance: 7077.75, price: TOKEN_USD_MAPPER[TOKEN.MOAI] },
      { name: TOKEN.WETH, weight: 20, balance: 147, price: TOKEN_USD_MAPPER[TOKEN.WETH] },
    ],
    value: '$1,259,280',
    volume: '$78,086',
    apy: '6.79%',
    fees: '$234.25',
    lpTokens: 100,
    name: '80MOAI-20WETH',
  },
  {
    compositions: [
      { name: TOKEN.WETH, weight: 50, balance: 147, price: TOKEN_USD_MAPPER[TOKEN.WETH] },
      { name: TOKEN.USDC, weight: 30, balance: 90, price: TOKEN_USD_MAPPER[TOKEN.USDC] },
      { name: TOKEN.USDT, weight: 20, balance: 60, price: TOKEN_USD_MAPPER[TOKEN.USDT] },
    ],
    value: '$10,073,500',
    volume: '$458,137',
    apy: '4.98%',
    fees: '$1374.411',
    lpTokens: 100,
    name: '50WETH-30USDC-20USDT',
  },
];
