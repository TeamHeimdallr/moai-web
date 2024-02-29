import { Address } from 'viem';

import { useNetwork } from '~/hooks/contexts/use-network';

import { useEnterOrExitMarket as useEnterOrExitMarketEvm } from '../_evm/lending/enter-exit-market';
import { useEnterOrExitMarket as useEnterOrExitMarketFpass } from '../_evm/lending/enter-exit-market-substrate';

interface Props {
  marketAddress: Address;
  currentStatus: 'enable' | 'disable';
  enabled?: boolean;
}
export const useEnterOrExitMarket = ({ marketAddress, currentStatus, enabled }: Props) => {
  const { isFpass } = useNetwork();

  const resEvm = useEnterOrExitMarketEvm({ marketAddress, currentStatus, enabled });
  const resFpass = useEnterOrExitMarketFpass({ marketAddress, currentStatus, enabled });

  return isFpass ? resFpass : resEvm;
};
