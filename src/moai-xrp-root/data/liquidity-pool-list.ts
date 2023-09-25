import { POOL_ID } from '~/moai-xrp-root/constants';

import { LiquidityPoolIds } from '~/moai-xrp-root/types/components';

export const liquidityPools: Record<string, LiquidityPoolIds[]> = {
  root: [{ id: POOL_ID.ROOT_XRP, isNew: true }],
};
