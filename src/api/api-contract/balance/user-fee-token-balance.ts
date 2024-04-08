import { useNetwork } from '~/hooks/contexts/use-network';

import { useUserFeeTokenBalance as useUserFeeTokenBalanceEvm } from '../_evm/balance/user-fee-token-balance';
import { useUserFeeTokenBalance as useUserFeeTokenBalanceXrp } from '../_xrpl/balance/user-fee-token-balance';

export const useUserFeeTokenBalance = () => {
  const { isEvm } = useNetwork();

  const resEvm = useUserFeeTokenBalanceEvm();
  const resXrp = useUserFeeTokenBalanceXrp();

  return isEvm ? resEvm : resXrp;
};
