import { Address } from 'wagmi';

import { useGetLiquidityPoolProvisions as useGetLiquidityPoolProvisionsEvm } from '~/api/api-contract/_evm/pool/get-liquidity-pool-provisions';
import { useGetLiquidityPoolProvisions as useGetLiquidityPoolProvisionsXrp } from '~/api/api-contract/_xrpl/pool/get-liquidity-pool-provisions';

import { useNetwork } from '~/hooks/contexts/use-network';

interface Props {
  id: string;
}
export const useGetLiquidityPoolProvisions = ({ id }: Props) => {
  const { isEvm } = useNetwork();

  const resEvm = useGetLiquidityPoolProvisionsEvm({ poolId: id as Address });
  const resXrp = useGetLiquidityPoolProvisionsXrp(id);

  return isEvm ? resEvm : resXrp;
};
