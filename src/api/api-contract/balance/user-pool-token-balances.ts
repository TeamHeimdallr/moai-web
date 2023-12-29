import { useNetwork } from '~/hooks/contexts/use-network';

import { useUserPoolTokenBalances as useUserPoolTokenBalancesEvm } from '../_evm/balance/user-pool-token-balances';
import { useUserPoolTokenBalances as useUserPoolTokenBalancesXrp } from '../_xrpl/balance/user-pool-token-balances';

interface Props {
  network: string;
  id: string;
}
export const useUserPoolTokenBalances = (props?: Props) => {
  const { isEvm } = useNetwork();

  const resEvm = useUserPoolTokenBalancesEvm(props);
  const resXrp = useUserPoolTokenBalancesXrp(props);

  return isEvm ? resEvm : resXrp;
};
