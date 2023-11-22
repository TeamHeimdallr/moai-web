import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { useWalletTypeStore } from '~/states/contexts/wallets/wallet-type';
import { NETWORK, POPUP_ID } from '~/types';

export const useBanner = () => {
  const location = useLocation();

  const { t } = useTranslation();
  const { open, close } = usePopup(POPUP_ID.WALLET_ALERT);
  const { open: openConnectWallet } = usePopup(POPUP_ID.CONNECT_WALLET);

  const { selectedNetwork } = useNetwork();
  const { fpass, evm, xrp, currentAddress } = useConnectedWallet();
  const { setWalletType } = useWalletTypeStore();

  const isSwap = location.pathname.includes('swap');
  const network =
    selectedNetwork === NETWORK.EVM_SIDECHAIN
      ? 'EVM sidechain'
      : selectedNetwork === NETWORK.THE_ROOT_NETWORK
      ? 'The Root Network'
      : 'XRPL';

  const text = t('wallet-alert-message', { network: network });

  useEffect(() => {
    // if wallet not connected or on the swap page, can proceed regardless of the selected network.
    if (!currentAddress || isSwap) {
      close();
      return;
    }

    if (
      (selectedNetwork === NETWORK.XRPL && !xrp.isConnected) ||
      (selectedNetwork === NETWORK.EVM_SIDECHAIN && !evm.isConnected) ||
      (selectedNetwork === NETWORK.THE_ROOT_NETWORK && !fpass.isConnected)
    ) {
      open();
      return;
    }
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evm.isConnected, fpass.isConnected, selectedNetwork, xrp.isConnected]);

  const connectWallet = () => {
    setWalletType({
      xrpl: selectedNetwork === NETWORK.XRPL,
      evm: selectedNetwork !== NETWORK.XRPL,
    });
    openConnectWallet();
  };

  return { text, connectWallet };
};
