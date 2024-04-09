import { useNetwork } from '~/hooks/contexts/use-network';

import { useUserAllTokenBalances as useUserAllTokenBalancesEvm } from '../_evm/balance/user-all-token-balances';
import { useUserAllTokenBalances as useUserAllTokenBalancesXrp } from '../_xrpl/balance/user-all-token-balances';

interface Props {
  includeLpToken?: boolean;
}
export const useUserAllTokenBalances = (props?: Props) => {
  const { includeLpToken } = props || {};

  const { isEvm } = useNetwork();

  const resEvm = useUserAllTokenBalancesEvm({ includeLpToken });
  const resXrp = useUserAllTokenBalancesXrp();

  return isEvm ? resEvm : resXrp;
};
