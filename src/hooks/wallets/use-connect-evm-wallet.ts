import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

import { useEvmChain } from '~/hooks/contexts';
import { truncateAddress } from '~/utils/util-string';

export const useConnectWithWalletConnect = () => {
  const { chains, chainId } = useEvmChain();
  const { address, isConnected, isConnecting } = useAccount();

  const { connect, data, error, isLoading } = useConnect({
    chainId,
    connector: new InjectedConnector({ chains }),
  });
  const connectedChainId = data?.chain.id ?? 0;

  const { disconnect } = useDisconnect();

  return {
    connect,
    disconnect,
    connectedChainId,
    isConnected,
    isConnecting: isConnecting || isLoading,
    isConnectError: error,

    address,
    truncatedAddress: truncateAddress(address),
  };
};
