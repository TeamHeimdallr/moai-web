import { getPublicKey, isInstalled as gemIsInstalled } from '@gemwallet/api';

import { truncateXrplAddress } from '~/utils/string';
import { useXrplWalletStore } from '~/states/data/xrpl-wallet';

export const useConnectXrplWallet = () => {
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

  return {
    connect,
    disconnect,
    isInstalled,
    isConnected,
    address,
    truncatedAddress: truncateXrplAddress(address),
  };
};
