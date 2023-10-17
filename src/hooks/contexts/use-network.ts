import { useMemo } from 'react';

import { useSelecteNetworkStore } from '~/states/data';
import { NETWORK } from '~/types';

export const useNetwork = () => {
  const { selectedNetwork, selectNetwork } = useSelecteNetworkStore();

  const isEvm =
    selectedNetwork === NETWORK.EVM_SIDECHAIN || selectedNetwork === NETWORK.THE_ROOT_NETWORK;
  const isXrp = selectedNetwork === NETWORK.XRPL;

  const name = useMemo(() => {
    if (selectedNetwork === NETWORK.THE_ROOT_NETWORK) return 'The Root Network';
    if (selectedNetwork === NETWORK.XRPL) return 'The XRP Ledger';
    if (selectedNetwork === NETWORK.EVM_SIDECHAIN) return 'Xrp EVM Sidechain';
  }, [selectedNetwork]);

  return {
    selectedNetwork,
    selectNetwork,
    isEvm,
    isXrp,
    name,
  };
};
