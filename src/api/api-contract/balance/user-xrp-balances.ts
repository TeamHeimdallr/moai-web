import { useNetwork } from '~/hooks/contexts/use-network';

import { useUserXrpBalances as useUserXrpBalancesEvm } from '../_evm/balance/user-xrp-balances';
import { useUserXrpBalances as useUserXrpBalancesXrp } from '../_xrpl/balance/user-xrp-balances';

export const useUserXrpBalances = () => {
  const { isEvm } = useNetwork();

  const resEvm = useUserXrpBalancesEvm();
  const resXrp = useUserXrpBalancesXrp();

  return isEvm ? resEvm : resXrp;
};
