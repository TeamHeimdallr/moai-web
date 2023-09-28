import { useEffect } from 'react';
import { getPublicKey, isInstalled as gemIsInstalled } from '@gemwallet/api';

import { truncateXrplAddress } from '~/utils/string';
import { useXrplWalletStore } from '~/states/data/xrpl-wallet';

export const useConnectXrplWallet = () => {
  const { isInstalled, isConnected, address, setInfo, setIsInstalled } = useXrplWalletStore();

  const connect = async () => {
    const installed = (await gemIsInstalled())?.result?.isInstalled || false;

    if (installed) {
      const { publicKey, address } = (await getPublicKey())?.result || {
        publicKey: '',
        address: '',
      };

      setInfo({
        isInstalled: installed,
        isConnected: !!publicKey,
        address,
      });
    }
  };

  const disconnect = () => {
    setInfo({
      isInstalled: isInstalled,
      isConnected: false,
      address: '',
    });
  };

  useEffect(() => {
    const getInstalled = async () => {
      const installed = (await gemIsInstalled())?.result?.isInstalled || false;
      setIsInstalled(installed);
    };
    getInstalled();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    connect,
    disconnect,
    isInstalled,
    isConnected,
    address,
    truncatedAddress: truncateXrplAddress(address),
  };
};
