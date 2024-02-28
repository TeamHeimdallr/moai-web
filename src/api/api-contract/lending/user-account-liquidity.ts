import { useUserAccountLiquidity as useUserAccountLiquidityEvm } from '../_evm/lending/user-account-liquidity';

export const useUserAccountLiquidity = () => {
  const resEvm = useUserAccountLiquidityEvm();
  return resEvm;
};
