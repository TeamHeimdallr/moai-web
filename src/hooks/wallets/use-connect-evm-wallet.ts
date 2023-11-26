import { useWeb3Modal } from '@web3modal/react';
import { useAccount, useConfig, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

import { truncateAddress } from '~/utils/util-string';

export const useConnectWithEvmWallet = () => {
  const { connectors } = useConfig();
  const { address, isConnected, isConnecting } = useAccount();
  const { open: connectByWalletConnect } = useWeb3Modal();

  const { disconnect: _disconnect } = useDisconnect();

  const {
    connectAsync: connectInjectedConnector,
    error,
    isLoading,
  } = useConnect({
    connector: new InjectedConnector(),
  });
  const connectedConnector = connectors?.[0]?.name ?? '';

  const disconnect = () => {
    _disconnect();
    localStorage.removeItem('wagmi.injected.shimDisconnect');
  };
  const connect = async () => {
    if (window.ethereum) {
      await connectInjectedConnector();
      localStorage.setItem('wagmi.injected.shimDisconnect', 'true');
    } else connectByWalletConnect(true);
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
