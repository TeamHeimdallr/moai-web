import { useNetwork } from '~/hooks/contexts/use-network';

import { useCalculateWithdrawLiquidity as useCalculateWithdrawLiquidityEvm } from '../_evm/pool/calculate-withdraw-liquidity';
import { useCalculateWithdrawLiquidity as useCalculateWithdrawLiquidityXrp } from '../_xrpl/pool/calculate-withdraw-liquidity';

interface Props {
  bptIn: number;
}
export const useCalculateWithdrawLiquidity = ({ bptIn }: Props) => {
  const { isEvm } = useNetwork();

  const resEvm = useCalculateWithdrawLiquidityEvm({ bptIn });
  const resXrp = useCalculateWithdrawLiquidityXrp({ bptIn });

  return isEvm ? resEvm : resXrp;
};
