import { useNetwork } from '~/hooks/contexts/use-network';
import { ITokenbalanceInPool } from '~/types';

import { useTokenBalanceInPool as useTokenBalanceInPoolEvm } from '../_evm/balance/get-token-balance-in-pool';
import { useTokenBalanceInPool as useTokenBalanceInPoolXrp } from '../_xrpl/balance/get-token-balance-in-pool';

export const useTokenBalanceInPool = (): ITokenbalanceInPool => {
  const { isEvm } = useNetwork();

  const resEvm = useTokenBalanceInPoolEvm();
  const resXrp = useTokenBalanceInPoolXrp();

  return isEvm ? resEvm : resXrp;
};
