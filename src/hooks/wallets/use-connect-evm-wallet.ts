import { useWeb3Modal } from '@web3modal/react';
import { useAccount, useConfig, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

import { truncateAddress } from '~/utils/util-string';

// TODO: connect wallet persist. 지금은 한번 연결 후 새로고침시 useAccount에서 값이 제대로 받아와지지 않음
export const useConnectWithEvmWallet = () => {
  const { connectors } = useConfig();
  const { address, isConnected, isConnecting } = useAccount();
  const { open: connectByWalletConnect } = useWeb3Modal();

  const {
    connect: connectInjectedConnector,
    error,
    isLoading,
  } = useConnect({
    connector: new InjectedConnector(),
  });
  const connectedConnector = connectors?.[0]?.name ?? '';

  const { disconnect } = useDisconnect();
  const connect = () => {
    if (window.ethereum) connectInjectedConnector();
    else connectByWalletConnect(true);
  };

  return {
    connect,
    connectByWalletConnect: () => connectByWalletConnect(true),

    disconnect,
    connectedConnector,
    isConnected,
    isConnecting: isConnecting || isLoading,
    isConnectError: error,
    isInstalled: !!window.ethereum,

    address: (address ?? '') as string,
    truncatedAddress: truncateAddress(address),
  };
};
