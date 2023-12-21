import { useWeb3Modal } from '@web3modal/react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

import { truncateAddress } from '~/utils/util-string';

export const useConnectWithEvmWallet = () => {
  const { address, isConnected, isConnecting, connector } = useAccount();
  const { open: connectByWalletConnect } = useWeb3Modal();

  const { disconnect: _disconnect } = useDisconnect();

  const {
    connectAsync: connectInjectedConnector,
    error,
    isLoading,
  } = useConnect({
    connector: new InjectedConnector({
      options: {
        name: detectedName =>
          `${(typeof detectedName === 'string' ? detectedName : '').toLowerCase()}`,
      },
    }),
  });
  const connectedConnector = (connector?.name ?? '').toLowerCase();

  const disconnect = () => {
    _disconnect();
    localStorage.removeItem('wagmi.injected.shimDisconnect');
  };

  const connect = async () => {
    if (window.ethereum && window.ethereum.isMetaMask) {
      await connectInjectedConnector();
      localStorage.setItem('wagmi.injected.shimDisconnect', 'true');
    } else connectByWalletConnect(true);
  };

  const metamaskConnected = isConnected && connectedConnector === 'metamask';
  const walletConnectionConnected = isConnected && connectedConnector !== 'metamask';

  return {
    connect,
    connectByWalletConnect: () => connectByWalletConnect(true),

    disconnect,
    connectedConnector,
    isConnected,

    metamaskConnected,
    walletConnectionConnected,

    isConnecting: isConnecting || isLoading,
    isConnectError: error,
    isInstalled: !!window.ethereum && !!window.ethereum.isMetaMask,

    address: (address ?? '') as string,
    truncatedAddress: truncateAddress(address),
  };
};
