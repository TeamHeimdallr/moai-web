import { useEffect } from 'react';

import { ENABLE_GA_LOG, IS_LOCAL } from '~/constants';

import { useTheRootNetworkSwitchWalletStore } from '~/states/contexts/wallets/switch-wallet';
import { NETWORK } from '~/types';

import { analytics } from '~/configs/analystics';

import { useNetwork } from '../contexts/use-network';
import { useConnectedWallet } from '../wallets';

export const useGAIdenitiy = () => {
  const { selectedWallet: selectedWalletTRN } = useTheRootNetworkSwitchWalletStore();

  const { evm, fpass, xrp } = useConnectedWallet();
  const { selectedNetwork } = useNetwork();

  const currentAddress =
    selectedNetwork === NETWORK.THE_ROOT_NETWORK
      ? selectedWalletTRN === 'fpass'
        ? fpass?.address
        : evm?.address
      : selectedNetwork === NETWORK.EVM_SIDECHAIN
      ? evm?.address
      : xrp?.address;

  useEffect(() => {
    if (IS_LOCAL && ENABLE_GA_LOG) {
      console.log('[GA] identity', currentAddress, {
        evm: evm.address,
        fpass: fpass.address,
        xrp: xrp.address,
      });
      return;
    }
    analytics.identify(currentAddress, {
      evm: evm.address,
      fpass: fpass.address,
      xrp: xrp.address,
    });
  }, [currentAddress, evm.address, fpass.address, xrp.address]);
};
