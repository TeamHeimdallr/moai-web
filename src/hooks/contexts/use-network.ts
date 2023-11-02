import { useMemo } from 'react';

import { IS_MAINNET } from '~/constants';

import { useSelecteNetworkStore } from '~/states/data';
import { NETWORK } from '~/types';

import { theRootNetworkTestnet, xrpEvmSidechainTestnet } from '~/configs/evm-network';

export const useNetwork = () => {
  const { selectedNetwork, selectNetwork, targetNetwork, setTargetNetwork, resetTarget } =
    useSelecteNetworkStore();

  const isEvm =
    selectedNetwork === NETWORK.EVM_SIDECHAIN || selectedNetwork === NETWORK.THE_ROOT_NETWORK;
  const isXrp = selectedNetwork === NETWORK.XRPL;
  const isFpass = selectedNetwork === NETWORK.THE_ROOT_NETWORK;

  const name = useMemo(() => {
    if (selectedNetwork === NETWORK.THE_ROOT_NETWORK) return 'The Root Network';
    if (selectedNetwork === NETWORK.XRPL) return 'The XRP Ledger';
    if (selectedNetwork === NETWORK.EVM_SIDECHAIN) return 'Xrp EVM Sidechain';
  }, [selectedNetwork]);

  return {
    selectedNetwork,
    selectNetwork,
    targetNetwork,
    setTargetNetwork,
    resetTarget,
    isEvm,
    isXrp,
    isFpass,
    name,
  };
};

export const useNetworkId = (network: NETWORK) => {
  if (network === NETWORK.THE_ROOT_NETWORK) {
    return IS_MAINNET ? 0 : theRootNetworkTestnet.id;
  }
  if (network === NETWORK.EVM_SIDECHAIN) {
    return IS_MAINNET ? 0 : xrpEvmSidechainTestnet.id;
  }
  return 0;
};
