// import { useModal } from 'connectkit';
import { useAccount, useConfig, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

import { truncateAddress } from '~/utils/util-string';

// TODO: connect wallet persist. 지금은 한번 연결 후 새로고침시 useAccount에서 값이 제대로 받아와지지 않음
export const useConnectWithEvmWallet = () => {
  const { connectors } = useConfig();
  const { address, isConnected, isConnecting } = useAccount();
  // const { setOpen } = useModal();

  const {
    connect: connectInjectedConnector,
    error,
    isLoading,
  } = useConnect({
    connector: connectors?.[0] || new InjectedConnector(),
  });
  const connectedConnector = connectors?.[0]?.name ?? '';

  const { disconnect } = useDisconnect();
  const connect = () => {
    // has injected provider
    if (window.ethereum) connectInjectedConnector();

    // others, open connectkit modal
    // TODO: connectkit 최적화 후 사용
    // else setOpen(true);
  };

  return {
    connect,
    disconnect,
    connectedConnector,
    isConnected,
    isConnecting: isConnecting || isLoading,
    isConnectError: error,

    address: (address ?? '') as string,
    truncatedAddress: truncateAddress(address),
  };
};
