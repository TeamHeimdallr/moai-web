import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useWeb3Modal } from '@web3modal/react';
import { mainnet, sepolia, useAccount, useNetwork as useNetworkWagmi } from 'wagmi';

import { IS_MAINNET } from '~/constants';

import { usePopup } from '~/hooks/components';
import { useConnectedWallet } from '~/hooks/wallets';
import { POPUP_ID } from '~/types';

import { theRootNetwork } from '~/configs/evm-network';

import { useSelecteNetworkStore } from '../states';
import { getNetworkName } from '../utils/network-name';

import { useSwitchAndAddNetwork } from './use-add-network';

export const useBanner = () => {
  const location = useLocation();
  const { from } = useSelecteNetworkStore();

  const { switchNetwork } = useSwitchAndAddNetwork();
  const { close: web3modalClose } = useWeb3Modal();
  const { isDisconnected, isConnecting, isReconnecting } = useAccount();
  const { chain } = useNetworkWagmi();

  const { t } = useTranslation();
  const { open, close } = usePopup(POPUP_ID.WALLET_ALERT_BRIDGE);

  const { anyAddress } = useConnectedWallet();

  const ethereum = IS_MAINNET ? mainnet : sepolia;
  const network = getNetworkName(from);

  const text = t('wallet-alert-message-switch', { network });
  const isBridge = location.pathname.includes('bridge');

  useEffect(() => {
    if (isDisconnected || isConnecting || isReconnecting || !anyAddress || !isBridge) {
      web3modalClose();
      close();
      return;
    }
    const chainId = chain?.id || 0;

    if (
      (from === 'THE_ROOT_NETWORK' && chainId !== theRootNetwork.id) ||
      (from === 'ETHEREUM' && chainId !== ethereum.id)
    ) {
      switchNetwork();
      open();

      return;
    }

    web3modalClose();
    close();
  }, [
    anyAddress,
    chain?.id,
    close,
    ethereum.id,
    from,
    isBridge,
    isConnecting,
    isDisconnected,
    isReconnecting,
    open,
    switchNetwork,
    web3modalClose,
  ]);

  return {
    text,
    switchNetwork,
  };
};
