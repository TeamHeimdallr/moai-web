import { useModal } from 'connectkit';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

import { useEvm } from '~/hooks/contexts';
import { truncateAddress } from '~/utils/util-string';

export const useConnectWithEvmWallet = () => {
  const { chains, chainId } = useEvm();
  const { address, isConnected, isConnecting } = useAccount();
  const { setOpen } = useModal();

  const {
    connect: connectInjectedConnector,
    data,
    error,
    isLoading,
  } = useConnect({
    chainId,
    connector: new InjectedConnector({ chains }),
  });
  const connectedChainId = data?.chain.id ?? 0;
  const connectedConnector = data?.connector?.name ?? '';

  const { disconnect } = useDisconnect();
  const connect = () => {
    // has injected provider
    if (window.ethereum) connectInjectedConnector();
    // others, open connectkit modal
    else setOpen(true);
  };

  return {
    connect,
    disconnect,
    connectedChainId,
    connectedConnector,
    isConnected,
    isConnecting: isConnecting || isLoading,
    isConnectError: error,

    address: (address ?? '') as string,
    truncatedAddress: truncateAddress(address),
  };
};
