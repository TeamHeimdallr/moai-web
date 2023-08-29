import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

import { chains } from '~/configs/setup-wallet';
import { DEFAULT_CHAIN_ID } from '~/constants';
import { truncateAddress } from '~/utils/string';

export const useConnectWallet = (chainId: number = DEFAULT_CHAIN_ID) => {
  const { address, isConnected, isConnecting } = useAccount();

  const { connect, error, isLoading } = useConnect({
    chainId,
    connector: new InjectedConnector({ chains }),
  });

  const { disconnect } = useDisconnect();

  return {
    connect,
    disconnect,
    isConnected,
    isConnecting: isConnecting || isLoading,
    isConnectError: error,

    address,
    truncatedAddress: truncateAddress(address),
  };
};
