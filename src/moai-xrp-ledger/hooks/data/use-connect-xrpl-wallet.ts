import { useEffect } from 'react';
import { getAddress as gemGetAddress, isInstalled as gemIsInstalled } from '@gemwallet/api';

import { truncateXrplAddress } from '~/utils/string';

import { useXrplWalletStore } from '~/moai-xrp-ledger/states/data/xrpl-wallet';

export const useConnectXrplWallet = () => {
  const { isInstalled, isConnected, address, setInfo, setIsInstalled } = useXrplWalletStore();

  const connect = async () => {
    const address = (await gemGetAddress())?.result?.address || '';

    setInfo({
      isInstalled,
      isConnected: !!address,
      address,
    });
  };

  const updateIsInstalled = async () => {
    const installed = (await gemIsInstalled())?.result?.isInstalled || false;

    setIsInstalled(installed);
  };

  useEffect(() => {
    updateIsInstalled();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    connect,
    isConnected,
    address,
    truncatedAddress: truncateXrplAddress(address),
  };
};
