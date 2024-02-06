import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUpdateEffect } from 'usehooks-ts';

import { getNetworkFull } from '~/utils';
import { useTheRootNetworkSwitchWalletStore } from '~/states/contexts/wallets/switch-wallet';
import { useSelecteNetworkStore } from '~/states/data';
import { NETWORK, POPUP_ID } from '~/types';

import { theRootNetwork, xrpEvmSidechain } from '~/configs/evm-network';

import { usePopup } from '../components';

export const useNetwork = () => {
  const { selectedWallet: selectedWalletTRN } = useTheRootNetworkSwitchWalletStore();

  const { selectedNetwork, selectNetwork } = useSelecteNetworkStore();

  const isEvm =
    selectedNetwork === NETWORK.EVM_SIDECHAIN || selectedNetwork === NETWORK.THE_ROOT_NETWORK;
  const isXrp = selectedNetwork === NETWORK.XRPL;
  const isFpass = selectedNetwork === NETWORK.THE_ROOT_NETWORK && selectedWalletTRN === 'fpass';

  const name = useMemo(() => {
    if (selectedNetwork === NETWORK.THE_ROOT_NETWORK) return 'The Root Network';
    if (selectedNetwork === NETWORK.XRPL) return 'The XRP Ledger';
    if (selectedNetwork === NETWORK.EVM_SIDECHAIN) return 'Xrp EVM Sidechain';
  }, [selectedNetwork]);

  return {
    selectedNetwork,
    selectNetwork,
    isEvm,
    isXrp,
    isFpass,
    name,
  };
};

export const useNetworkId = (network: NETWORK) => {
  if (network === NETWORK.THE_ROOT_NETWORK) return theRootNetwork.id;
  if (network === NETWORK.EVM_SIDECHAIN) return xrpEvmSidechain.id;
  return 0;
};

interface UseFroceNetwork {
  popupId?: POPUP_ID;
  enableParamsNetwork?: boolean;
  enableChangeAndRedirect?: boolean;
  targetNetwork?: NETWORK[];
  changeTargetNetwork?: NETWORK;
  callCallbackUnmounted?: boolean;
  redirectTo?: string;
}
export const useForceNetwork = ({
  popupId,
  enableParamsNetwork,
  enableChangeAndRedirect,
  targetNetwork,
  changeTargetNetwork,
  callCallbackUnmounted,
  redirectTo,
}: UseFroceNetwork) => {
  const navigate = useNavigate();
  const { network } = useParams();
  const { selectNetwork, selectedNetwork } = useNetwork();

  const networkFull = getNetworkFull(network as NETWORK);
  const { open: openNetworkAlert, reset } = usePopup(popupId || POPUP_ID.NETWORK_ALERT);

  useEffect(() => {
    if (!enableParamsNetwork) return;
    if (!networkFull || networkFull === selectedNetwork) return;

    const callback = () => {
      selectNetwork(networkFull);
      reset();
    };

    const unmountCallback = () => {
      if (callCallbackUnmounted) callback();
    };

    openNetworkAlert({ callback, unmountCallback });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useUpdateEffect(() => {
    if (!enableChangeAndRedirect) return;
    if (!networkFull || networkFull === selectedNetwork) return;

    const callback = () => {
      selectNetwork(selectedNetwork);
      reset();
      navigate(redirectTo || '/');
    };

    const unmountCallback = () => {
      if (callCallbackUnmounted) callback();
    };

    openNetworkAlert({ callback, unmountCallback });
  }, [selectedNetwork]);

  useEffect(() => {
    if (
      !targetNetwork ||
      targetNetwork.length === 0 ||
      enableParamsNetwork ||
      enableChangeAndRedirect
    )
      return;
    if (targetNetwork.includes(selectedNetwork)) return;

    const callback = () => {
      selectNetwork(changeTargetNetwork || selectedNetwork);
      reset();

      if (!changeTargetNetwork) navigate(redirectTo || '/');
    };

    const unmountCallback = () => {
      if (callCallbackUnmounted) callback();
    };

    openNetworkAlert({ callback, unmountCallback });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNetwork]);
};
