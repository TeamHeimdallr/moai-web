import { useNetwork } from '~/hooks/contexts/use-network';
import { ITokenComposition } from '~/types';

import { useCalculateAddLiquidity as useCalculateAddLiquidityEvm } from '../_evm/pool/calculate-add-liquidity';
import { useCalculateAddLiquidity as useCalculateAddLiquidityXrp } from '../_xrpl/pool/calculate-add-liquidity';

interface Props {
  tokensInBigint?: (ITokenComposition & { amount: bigint })[]; // TODO: required
  amountsIn: number[];
  txHash?: string;
}
export const useCalculateAddLiquidity = ({ tokensInBigint, amountsIn, txHash }: Props) => {
  const { isEvm } = useNetwork();

  const resEvm = useCalculateAddLiquidityEvm({ tokensInBigint, amountsIn, txHash });
  const resXrp = useCalculateAddLiquidityXrp({ amountsIn, txHash });

  return isEvm ? resEvm : resXrp;
};
