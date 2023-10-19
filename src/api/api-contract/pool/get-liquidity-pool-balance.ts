import { Address } from 'wagmi';

import { useLiquidityPoolBalance as useLiquidityPoolBalanceEvm } from '~/api/api-contract/_evm/pool/get-liquidity-pool-balance';
import { useLiquidityPoolBalance as useLiquidityPoolBalanceXrp } from '~/api/api-contract/_xrpl/pool/get-liquidity-pool-balance';

import { useNetwork } from '~/hooks/contexts/use-network';

export const useLiquidityPoolBalance = (id: string) => {
  const { isEvm } = useNetwork();

  const resEvm = useLiquidityPoolBalanceEvm({ id: id as Address });
  const resXrp = useLiquidityPoolBalanceXrp({ id });

  return isEvm ? resEvm : resXrp;
};
