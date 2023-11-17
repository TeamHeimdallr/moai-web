import { useEffect } from 'react';
import crossmarkSdk from '@crossmarkio/sdk';
import { getPublicKey, isInstalled as gemIsInstalled } from '@gemwallet/api';

import { truncateAddress } from '~/utils/util-string';
import { useCrossmarkWalletStore } from '~/states/contexts/wallets/crossmark-wallet';
import { useXrplWalletStore } from '~/states/contexts/wallets/gem-wallet';

export const useConnectWithGemWallet = () => {
  const { isInstalled, isConnected, address, setInfo, setInstalled } = useXrplWalletStore();

  const connect = async () => {
    const installed = (await gemIsInstalled())?.result?.isInstalled || window.gemWallet || false;

    if (installed) {
      const { publicKey, address } = (await getPublicKey())?.result || {
        publicKey: '',
        address: '',
      };

      setInfo({
        isInstalled: installed,
        isConnected: !!publicKey && !!address,
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
      const isInstalled = (await gemIsInstalled())?.result?.isInstalled;
      setInstalled({ isInstalled });
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

export const useConnectWithCrossmarkWallet = () => {
  const { isConnected, address, setInfo } = useCrossmarkWalletStore();

  const isInstalled = window.crossmark;
  const connect = async () => {
    const connected = await crossmarkSdk.connect(60 * 60 * 1000); // 1 minute
    const signed = await crossmarkSdk.signInAndWait();

    const address = crossmarkSdk.session.address;

    setInfo({
      isConnected: connected && !!signed && !!address,
      address,
    });
  };

  const disconnect = () => {
    setInfo({
      isConnected: false,
      address: '',
    });
  };

  return {
    connect,
    disconnect,
    isInstalled,
    isConnected,
    address,
    truncatedAddress: truncateAddress(address),
  };
};
