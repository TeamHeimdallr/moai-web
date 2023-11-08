import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { useWalletTypeStore } from '~/states/contexts/wallets/wallet-type';
import { NETWORK, POPUP_ID } from '~/types';

export const useBanner = () => {
  const { open, close } = usePopup(POPUP_ID.WALLET_ALERT);
  const { selectedNetwork } = useNetwork();
  const { fpass, evm, xrp } = useConnectedWallet();
  const { setWalletType } = useWalletTypeStore();
  const { open: openConnectWallet } = usePopup(POPUP_ID.CONNECT_WALLET);
  const { t } = useTranslation();
  const network =
    selectedNetwork === NETWORK.EVM_SIDECHAIN
      ? 'EVM'
      : selectedNetwork === NETWORK.THE_ROOT_NETWORK
      ? 'Root'
      : 'XRPL';

  const text = t('wallet-alert-message', { network: network });

  useEffect(() => {
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
