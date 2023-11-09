import { useNetwork } from '~/hooks/contexts/use-network';

import { useUserPoolTokenBalances as useUserPoolTokenBalancesEvm } from '../_evm/balance/user-pool-token-balances';
import { useUserPoolTokenBalances as useUserPoolTokenBalancesXrp } from '../_xrpl/balance/user-pool-token-balances';

export const useUserPoolTokenBalances = () => {
  const { isEvm } = useNetwork();

  const resEvm = useUserPoolTokenBalancesEvm();
  const resXrp = useUserPoolTokenBalancesXrp();

  return isEvm ? resEvm : resXrp;
};
