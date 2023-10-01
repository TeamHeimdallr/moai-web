import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

import { truncateAddress } from '~/utils/string';

import { chains } from '~/configs/setup-evm-client';

import { CHAIN_ID } from '~/moai-xrp-root/constants';

export const useConnectEvmWallet = (chainId: number = CHAIN_ID) => {
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
