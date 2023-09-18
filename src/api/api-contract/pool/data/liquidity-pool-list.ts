import { POOL_ID } from '~/constants';
import { LiquidityPoolData, MyLiquidityPoolData } from '~/types/components';
import { TOKEN } from '~/types/contracts';

export const liquidityPoolLists: Record<string, LiquidityPoolData[]> = {
  root: [],
  mantle_linea: [
    {
      id: POOL_ID.POOL_A,
      assets: [TOKEN.MOAI, TOKEN.WETH],
      composition: {
        [TOKEN.MOAI]: 80,
        [TOKEN.WETH]: 20,
      } as Record<TOKEN, number>,
      pool: {
        [TOKEN.MOAI]: 7077.75,
        [TOKEN.WETH]: 147,
      } as Record<TOKEN, number>,
      volume: 78086.25,
      apr: 6.79,
      isNew: true,
    },
    {
      id: POOL_ID.POOL_B,
      assets: [TOKEN.WETH, TOKEN.USDC, TOKEN.USDT],
      composition: {
        [TOKEN.WETH]: 50,
        [TOKEN.USDC]: 30,
        [TOKEN.USDT]: 20,
      } as Record<TOKEN, number>,
      pool: {
        [TOKEN.WETH]: 293,
        [TOKEN.USDC]: 302205,
        [TOKEN.USDT]: 201470,
      } as Record<TOKEN, number>,
      volume: 45813,
      apr: 4.98,
      isNew: true,
    },
  ],
};

export const myLiquidityPoolLists: Record<string, MyLiquidityPoolData[]> = {
  root: [],
  mantle_linea: [
    {
      id: POOL_ID.POOL_A,
      assets: [TOKEN.MOAI, TOKEN.WETH],
      composition: {
        [TOKEN.MOAI]: 80,
        [TOKEN.WETH]: 20,
      } as Record<TOKEN, number>,
      pool: {
        [TOKEN.MOAI]: 7077.75,
        [TOKEN.WETH]: 147,
      } as Record<TOKEN, number>,
      balance: 693194,
      apr: 6.79,
      isNew: false,
    },
  ],
};
