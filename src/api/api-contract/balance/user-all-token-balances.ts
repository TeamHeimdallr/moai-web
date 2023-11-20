import { useNetwork } from '~/hooks/contexts/use-network';

import { useUserAllTokenBalances as useUserAllTokenBalancesEvm } from '../_evm/balance/user-all-token-balances';
import { useUserAllTokenBalances as useUserAllTokenBalancesXrp } from '../_xrpl/balance/user-all-token-balances';

export const useUserAllTokenBalances = () => {
  const { isEvm } = useNetwork();

  const resEvm = useUserAllTokenBalancesEvm();
  const resXrp = useUserAllTokenBalancesXrp();

  return isEvm ? resEvm : resXrp;
};
