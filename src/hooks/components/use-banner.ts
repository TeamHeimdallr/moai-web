import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useWeb3Modal } from '@web3modal/react';
import { useAccount, useNetwork as useNetworkWagmi } from 'wagmi';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { useWalletTypeStore } from '~/states/contexts/wallets/wallet-type';
import { NETWORK, POPUP_ID } from '~/types';

import { theRootNetwork } from '~/configs/evm-network';

export const useBanner = () => {
  const [type, setType] = useState<'select' | 'switch'>('select');

  const location = useLocation();

  const { open: web3modalOpen } = useWeb3Modal();
  const { isConnected } = useAccount();
  const { chain } = useNetworkWagmi();

  const { t } = useTranslation();
  const { open, close, opened } = usePopup(POPUP_ID.WALLET_ALERT);
  const { open: openConnectWallet } = usePopup(POPUP_ID.CONNECT_WALLET);

  const { selectedNetwork } = useNetwork();
  const { fpass, evm, xrp, anyAddress } = useConnectedWallet();
  const { setWalletType } = useWalletTypeStore();

  const isSwap = location.pathname.includes('swap');
  const network =
    selectedNetwork === NETWORK.EVM_SIDECHAIN
      ? 'EVM sidechain'
      : selectedNetwork === NETWORK.THE_ROOT_NETWORK
      ? 'The Root Network'
      : 'XRPL';

  const text = t(type === 'select' ? 'wallet-alert-message' : 'wallet-alert-message-switch', {
    network: network,
  });

  useEffect(() => {
    if (opened) return;

    // if wallet not connected or on the swap page, can proceed regardless of the selected network.
    if (!anyAddress || isSwap) {
      close();
      return;
    }

    if (
      (selectedNetwork === NETWORK.XRPL && !xrp.isConnected) ||
      (selectedNetwork === NETWORK.EVM_SIDECHAIN && !evm.isConnected) ||
      (selectedNetwork === NETWORK.THE_ROOT_NETWORK && !fpass.isConnected)
    ) {
      setType('select');
      open();

      return;
    }
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evm.isConnected, fpass.isConnected, selectedNetwork, xrp.isConnected, opened]);

  useEffect(() => {
    if (!isConnected || opened) return;
    const chainId = chain?.id || 0;

    if (selectedNetwork === NETWORK.THE_ROOT_NETWORK && chainId !== theRootNetwork.id) {
      setType('switch');
      web3modalOpen({ route: 'SelectNetwork' });

      open();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain?.id, isConnected, network, opened, selectedNetwork, t]);

  const connectWallet = () => {
    setWalletType({
      xrpl: selectedNetwork === NETWORK.XRPL,
      evm: selectedNetwork !== NETWORK.XRPL,
    });
    openConnectWallet();
  };

  return {
    text,
    type,
    connectWallet,
    switchNetwork: () => web3modalOpen({ route: 'SelectNetwork' }),
  };
};
