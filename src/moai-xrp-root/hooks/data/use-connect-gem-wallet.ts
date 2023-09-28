import { useEffect } from 'react';
import { getAddress, isInstalled } from '@gemwallet/api';

import { useGemAddressStore } from '~/states/data/gem-address';

export const useConnectGemWallet = () => {
  const { gemAddress, setGemAddress } = useGemAddressStore();

  const getGemAddress = async () => {
    const installed = await isInstalled();
    if (installed.result?.isInstalled) {
      const gemAddress = await getAddress();
      const address = gemAddress.result?.address;
      setGemAddress(address ?? '');
    }
  };

  useEffect(() => {
    if (gemAddress) return;
    // getGemAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { gemAddress, getGemAddress, setGemAddress };
};
