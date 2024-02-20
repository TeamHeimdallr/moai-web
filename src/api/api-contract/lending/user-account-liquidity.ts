// import { useNetwork } from '~/hooks/contexts/use-network';

import { useUserAccountLiquidity as useUserAccountLiquidityEvm } from '../_evm/lending/user-account-liquidity';

export const useUserAccountLiquidity = () => {
  //   const { isEvm } = useNetwork();

  const resEvm = useUserAccountLiquidityEvm();

  return resEvm;
  //   return isEvm ? resEvm : resXrp;
};
