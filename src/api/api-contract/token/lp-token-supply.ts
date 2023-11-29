import { useNetwork } from '~/hooks/contexts/use-network';
import { NETWORK } from '~/types';

import { useLpTokenTotalSupply as useLpTokenTotalSupplyEvm } from '../_evm/token/lp-token-supply';
import { useLpTokenTotalSupply as useLpTokenTotalSupplyXrp } from '../_xrpl/token/lp-token-supply';

interface Props {
  network: NETWORK;
  poolId: string;
}
export const useLpTokenTotalSupply = ({ network, poolId }: Props) => {
  const { isEvm } = useNetwork();

  const resEvm = useLpTokenTotalSupplyEvm({ network, poolId });
  const resXrp = useLpTokenTotalSupplyXrp({ network, poolId });

  return isEvm ? resEvm : resXrp;
};
