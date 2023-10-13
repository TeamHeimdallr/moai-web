import { useEffect } from 'react';
import { getPublicKey, isInstalled as gemIsInstalled } from '@gemwallet/api';

import { truncateAddress } from '~/utils/util-string';
import { useXrplWalletStore } from '~/states/contexts/wallets/gem-wallet';

export const useConnectWithGemWallet = () => {
  const { isInstalled, isConnected, address, setInfo } = useXrplWalletStore();

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
      const isInstalled = (await gemIsInstalled())?.result?.isInstalled || false;
      setInfo({ isInstalled });
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
    truncatedAddress: truncateAddress(address),
  };
};
