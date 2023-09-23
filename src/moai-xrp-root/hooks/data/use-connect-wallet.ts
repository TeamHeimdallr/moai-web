import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

import { truncateAddress } from '~/utils/string';

import { chains } from '~/configs/setup-evm-wallet';

import { CHAIN_ID } from '~/moai-xrp-root/constants';

export const useConnectWallet = (chainId: number = CHAIN_ID) => {
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
