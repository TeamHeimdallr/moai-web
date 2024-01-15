import { useEffect } from 'react';

import { ENABLE_GA_LOG, IS_LOCAL } from '~/constants';

import { NETWORK } from '~/types';

import { analytics } from '~/configs/analystics';

import { useNetwork } from '../contexts/use-network';
import { useConnectedWallet } from '../wallets';

export const useGAIdenitiy = () => {
  const { evm, fpass, xrp } = useConnectedWallet();
  const { selectedNetwork } = useNetwork();

  const currentAddress =
    selectedNetwork === NETWORK.THE_ROOT_NETWORK
      ? evm?.address
      : selectedNetwork === NETWORK.EVM_SIDECHAIN
      ? evm?.address
      : xrp?.address;

  useEffect(() => {
    const anyAddress = evm?.address || xrp?.address;

    if (IS_LOCAL && ENABLE_GA_LOG) {
      console.log('[GA] identity', anyAddress, {
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
