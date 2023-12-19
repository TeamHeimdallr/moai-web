import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useWeb3Modal } from '@web3modal/react';
import { useAccount, useNetwork as useNetworkWagmi } from 'wagmi';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { useWalletConnectorTypeStore } from '~/states/contexts/wallets/connector-type';
import { NETWORK, POPUP_ID } from '~/types';

import { theRootNetwork, xrpEvmSidechain } from '~/configs/evm-network';

import { useSwitchAndAddNetwork } from '../wallets/use-add-network';

export const useBanner = () => {
  const [type, setType] = useState<'select' | 'switch'>('select');

  const location = useLocation();

  const { switchNetwork } = useSwitchAndAddNetwork();
  const { close: web3modalClose } = useWeb3Modal();
  const { isDisconnected, isConnecting, isReconnecting } = useAccount();
  const { chain } = useNetworkWagmi();

  const { t } = useTranslation();
  const { open, close } = usePopup(POPUP_ID.WALLET_ALERT);
  const { open: openConnectWallet } = usePopup(POPUP_ID.CONNECT_WALLET);

  const { selectedNetwork } = useNetwork();
  const { fpass, evm, xrp, anyAddress } = useConnectedWallet();
  const { setWalletConnectorType } = useWalletConnectorTypeStore();

  const isSwap = location.pathname.includes('swap');
  const isRewards = location.pathname.includes('rewards');
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
    // if wallet not connected or on the swap page, can proceed regardless of the selected network.
    if (!anyAddress || isSwap || isRewards) {
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
  }, [
    evm.isConnected,
    fpass.isConnected,
    selectedNetwork,
    xrp.isConnected,
    isSwap,
    isRewards,
    anyAddress,
  ]);

  useEffect(() => {
    if (isDisconnected || isConnecting || isReconnecting || !anyAddress || isSwap || isRewards) {
      web3modalClose();
      close();
      return;
    }
    const chainId = chain?.id || 0;

    if (
      (selectedNetwork === NETWORK.THE_ROOT_NETWORK && chainId !== theRootNetwork.id) ||
      (selectedNetwork === NETWORK.EVM_SIDECHAIN && chainId !== xrpEvmSidechain.id)
    ) {
      setType('switch');
      switchNetwork();
      // web3modalOpen({ route: 'SelectNetwork' });
      open();

      return;
    }

    web3modalClose();
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chain?.id,
    isDisconnected,
    isConnecting,
    isReconnecting,
    network,
    selectedNetwork,
    t,
    isSwap,
    isRewards,
    anyAddress,
  ]);

  const connectWallet = () => {
    setWalletConnectorType({ network: selectedNetwork });
    openConnectWallet();
  };

  return {
    text,
    type,
    connectWallet,
    // switchNetwork: () => web3modalOpen({ route: 'SelectNetwork' }),
    switchNetwork,
  };
};
