import { Address } from 'viem';

import { useEnterOrExitMarket as useEnterOrExitMarketEvm } from '../_evm/lending/enter-exit-market';

interface Props {
  marketAddress: Address;
  currentStatus: 'enable' | 'disable';
  enabled?: boolean;
}
export const useEnterOrExitMarket = ({ marketAddress, currentStatus, enabled }: Props) => {
  const resEvm = useEnterOrExitMarketEvm({ marketAddress, currentStatus, enabled });
  return resEvm;
};
