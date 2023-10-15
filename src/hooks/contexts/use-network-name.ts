import { useSelecteNetworkStore } from '~/states/data';
import { NETWORK } from '~/types';

export const useNetworkName = () => {
  const { selectedNetwork } = useSelecteNetworkStore();

  if (selectedNetwork === NETWORK.THE_ROOT_NETWORK) return 'The Root Network';
  if (selectedNetwork === NETWORK.XRPL) return 'The XRP Ledger';
  if (selectedNetwork === NETWORK.EVM_SIDECHAIN) return 'Xrp EVM Sidechain';

  return 'Unkonwn Network';
};
