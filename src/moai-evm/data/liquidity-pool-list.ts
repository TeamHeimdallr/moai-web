import { POOL_ID } from '~/moai-evm/constants';

import { LiquidityPoolIds } from '~/moai-evm/types/components';

export const liquidityPools: Record<string, LiquidityPoolIds[]> = {
  mantle: [{ id: POOL_ID.MOAI_WETH, isNew: true }],
  linea: [{ id: POOL_ID.MOAI_WETH, isNew: true }],
};
