import { useEffect } from 'react';

import { useXummWalletStore } from '~/states/contexts/wallets/xumm-wallet';

export const useXummWalletClient = () => {
  const { setInfo } = useXummWalletStore();

  useEffect(() => {
    const xummPkce = localStorage.getItem('XummPkceJwt');
    if (xummPkce) {
      const xummPkceJson = JSON.parse(xummPkce);
      const jwt = xummPkceJson.jwt;
      const me = xummPkceJson.me;

      setInfo({
        isConnected: true,
        jwt,
        address: me.account,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
