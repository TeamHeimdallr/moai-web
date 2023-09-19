import { POOL_ID } from '~/constants';
import { LiquidityPoolIds, MyLiquidityPoolData } from '~/types/components';
import { TOKEN } from '~/types/contracts';

export const liquidityPoolIds: Record<string, LiquidityPoolIds[]> = {
  root: [
    {
      id: POOL_ID.ROOT_XRP,
      assets: [TOKEN.ROOT, TOKEN.XRP],
      composition: {
        [TOKEN.MOAI]: 50,
        [TOKEN.WETH]: 50,
      } as Record<TOKEN, number>,
      isNew: true,
    },
  ],
  mantle: [
    {
      id: POOL_ID.POOL_A,
      assets: [TOKEN.MOAI, TOKEN.WETH],
      composition: {
        [TOKEN.MOAI]: 80,
        [TOKEN.WETH]: 20,
      } as Record<TOKEN, number>,
      isNew: true,
    },
  ],
  linea: [
    {
      id: POOL_ID.POOL_A,
      assets: [TOKEN.MOAI, TOKEN.WETH],
      composition: {
        [TOKEN.MOAI]: 80,
        [TOKEN.WETH]: 20,
      } as Record<TOKEN, number>,
      isNew: true,
    },
  ],
};

export const myLiquidityPoolLists: Record<string, MyLiquidityPoolData[]> = {
  root: [],
  mantle_linea: [],
};
