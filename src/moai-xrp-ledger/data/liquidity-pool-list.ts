import { POOL_ID } from '~/moai-xrp-ledger/constants';

import { LiquidityPoolIds } from '~/moai-xrp-ledger/types/components';

export const liquidityPools: Record<string, LiquidityPoolIds[]> = {
  xrpl: [{ id: POOL_ID.XRP_MOI, isNew: true }],
};
