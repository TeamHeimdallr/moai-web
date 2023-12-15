import { useEffect } from 'react';
import crossmarkSdk from '@crossmarkio/sdk';
import { getPublicKey, isInstalled as gemIsInstalled } from '@gemwallet/api';

import { truncateAddress } from '~/utils/util-string';
import { useXummStore } from '~/states/contexts/sdk/xumm';
import { useCrossmarkWalletStore } from '~/states/contexts/wallets/crossmark-wallet';
import { useXrplWalletStore } from '~/states/contexts/wallets/gem-wallet';
import { useXummWalletStore } from '~/states/contexts/wallets/xumm-wallet';

export const useConnectWithGemWallet = () => {
  const { isInstalled, isConnected, address, setInfo, setInstalled } = useXrplWalletStore();

  const connect = async () => {
    const installed =
      (await gemIsInstalled())?.result?.isInstalled || (window.gemWallet as boolean) || false;

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

  const isInstalled = (window.crossmark as boolean) || false;
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

export const useConnectWithXummWallet = () => {
  const { client, authClient } = useXummStore();
  const { isConnected, address, setInfo } = useXummWalletStore();

  const isInstalled = true; // always true
  const connect = async () => {
    if (!client || !authClient) return;

    const res = await authClient.authorize();
    if (res) {
      const { me } = res;
      setInfo({
        isConnected: true,
        jwt: res.jwt,
        address: me.account,
      });
    }
  };

  const disconnect = () => {
    authClient.logout();

    setInfo({
      isConnected: false,
      jwt: '',
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
