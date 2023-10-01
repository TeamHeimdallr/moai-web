import { POOL_ID } from '~/moai-xrp-evm/constants';

import { LiquidityPoolIds } from '~/moai-xrp-evm/types/components';

export const liquidityPools: Record<string, LiquidityPoolIds[]> = {
  xrpevm: [{ id: POOL_ID.WETH_XRP, isNew: true }],
};
