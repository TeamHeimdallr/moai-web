import { ISSUER } from '~/moai-xrp-ledger/constants';

import { LiquidityPoolIds } from '~/moai-xrp-ledger/types/components';

export const liquidityPools: Record<string, LiquidityPoolIds[]> = {
  xrpl: [{ id: ISSUER.XRP_MOI, isNew: true }],
};
