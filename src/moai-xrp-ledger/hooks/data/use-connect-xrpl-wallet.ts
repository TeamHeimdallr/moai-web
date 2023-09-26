import { getPublicKey, isInstalled as gemIsInstalled } from '@gemwallet/api';

import { truncateXrplAddress } from '~/utils/string';

import { useXrplStore } from '~/moai-xrp-ledger/states/data/xrpl';
import { useXrplWalletStore } from '~/moai-xrp-ledger/states/data/xrpl-wallet';

export const useConnectXrplWallet = () => {
  const { isConnected: isXrplConnected } = useXrplStore();
  const { isInstalled, isConnected, address, setInfo } = useXrplWalletStore();

  const connect = async () => {
    if (!isXrplConnected) return;
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

  return {
    connect,
    isInstalled,
    isConnected,
    address,
    truncatedAddress: truncateXrplAddress(address),
  };
};
