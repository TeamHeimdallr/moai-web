// import { useModal } from 'connectkit';
import { useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

import { useEvm } from '~/hooks/contexts';
import { truncateAddress } from '~/utils/util-string';
import { useMetamaskWalletStore } from '~/states/contexts/wallets/metamask-wallet';

// TODO: connect wallet persist. 지금은 한번 연결 후 새로고침시 useAccount에서 값이 제대로 받아와지지 않음
export const useConnectWithEvmWallet = () => {
  const { isConnected, address, setInfo } = useMetamaskWalletStore();

  const { chains } = useEvm();
  const { address: wagmiAddress, isConnected: wagmiIsConnected, isConnecting } = useAccount();
  // const { setOpen } = useModal();

  const {
    connect: connectInjectedConnector,
    data,
    error,
    isLoading,
  } = useConnect({
    connector: new InjectedConnector({ chains }),
  });
  const connectedChainId = data?.chain.id ?? 0;
  const connectedConnector = data?.connector?.name ?? '';

  const { disconnect } = useDisconnect();
  const connect = () => {
    // has injected provider
    if (window.ethereum) connectInjectedConnector();

    // others, open connectkit modal
    // TODO: connectkit 최적화 후 사용
    // else setOpen(true);
  };
  const handleDisconnect = () => {
    disconnect();
    setInfo({ isConnected: false, address: '' });
  };

  useEffect(() => {
    if (wagmiAddress && wagmiIsConnected)
      setInfo({ isConnected: wagmiIsConnected, address: wagmiAddress });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wagmiAddress, wagmiIsConnected]);

  return {
    connect,
    disconnect: handleDisconnect,
    connectedChainId,
    connectedConnector,
    isConnected,
    isConnecting: isConnecting || isLoading,
    isConnectError: error,

    address: (address ?? '') as string,
    truncatedAddress: truncateAddress(address),
  };
};
