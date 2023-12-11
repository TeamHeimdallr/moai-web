import { useMemo } from 'react';

import { useTheRootNetworkSwitchWalletStore } from '~/states/contexts/wallets/switch-wallet';
import { useSelecteNetworkStore } from '~/states/data';
import { NETWORK } from '~/types';

import { theRootNetwork, xrpEvmSidechain } from '~/configs/evm-network';

export const useNetwork = () => {
  const { selectedWallet: selectedWalletTRN } = useTheRootNetworkSwitchWalletStore();

  const { selectedNetwork, selectNetwork, targetNetwork, setTargetNetwork, resetTarget } =
    useSelecteNetworkStore();

  const isEvm =
    selectedNetwork === NETWORK.EVM_SIDECHAIN || selectedNetwork === NETWORK.THE_ROOT_NETWORK;
  const isXrp = selectedNetwork === NETWORK.XRPL;
  const isFpass = selectedNetwork === NETWORK.THE_ROOT_NETWORK && selectedWalletTRN === 'fpass';

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
  if (network === NETWORK.THE_ROOT_NETWORK) return theRootNetwork.id;
  if (network === NETWORK.EVM_SIDECHAIN) return xrpEvmSidechain.id;
  return 0;
};
