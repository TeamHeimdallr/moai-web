import { useNetwork } from '~/hooks/contexts/use-network';

import { useCalculateAddLiquidity as useCalculateAddLiquidityEvm } from '../_evm/pool/calculate-add-liquidity';
import { useCalculateAddLiquidity as useCalculateAddLiquidityXrp } from '../_xrpl/pool/calculate-add-liquidity';

interface Props {
  amountsIn: number[];
  txHash?: string;
}
export const useCalculateAddLiquidity = ({ amountsIn, txHash }: Props) => {
  const { isEvm } = useNetwork();

  const resEvm = useCalculateAddLiquidityEvm({ amountsIn, txHash });
  const resXrp = useCalculateAddLiquidityXrp({ amountsIn, txHash });

  return isEvm ? resEvm : resXrp;
};
