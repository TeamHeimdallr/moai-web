import { useGetLiquidityPoolLists as useGetLiquidityPoolListsEvm } from '~/api/api-contract/_evm/pool/get-liquidity-pool-lists';
import { useGetLiquidityPoolLists as useGetLiquidityPoolListsXrp } from '~/api/api-contract/_xrpl/pool/get-liquidity-pool-lists';

import { useNetwork } from '~/hooks/contexts/use-network';

export const useGetLiquidityPoolLists = () => {
  const { isEvm } = useNetwork();

  const resEvm = useGetLiquidityPoolListsEvm();
  const resXrp = useGetLiquidityPoolListsXrp();

  return isEvm ? resEvm : resXrp;
};
