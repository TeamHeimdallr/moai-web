import { useNetwork } from '~/hooks/contexts/use-network';

import { useCalculateAddLiquidity as useCalculateAddLiquidityEvm } from '../_evm/pool/calculate-add-liquidity';
import { useCalculateAddLiquidity as useCalculateAddLiquidityXrp } from '../_xrpl/pool/calculate-add-liquidity';

interface Props {
  amountsIn: number[];
}
export const useCalculateAddLiquidity = ({ amountsIn }: Props) => {
  const { isEvm } = useNetwork();

  const resEvm = useCalculateAddLiquidityEvm({ amountsIn });
  const resXrp = useCalculateAddLiquidityXrp({ amountsIn });

  return isEvm ? resEvm : resXrp;
};
