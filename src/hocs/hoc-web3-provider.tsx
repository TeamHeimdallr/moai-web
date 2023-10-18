import { useEffect, useState } from 'react';
import { ConnectKitProvider } from 'connectkit';
import { Chain, configureChains, createConfig, WagmiConfig } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { publicProvider } from 'wagmi/providers/public';

import { WALLETCONNECT_PROJECT_ID } from '~/constants';

import { useEvm } from '~/hooks/contexts';

interface Props {
  children: React.ReactNode;
}
const Web3Provider = ({ children }: Props) => {
  const { chains } = useEvm();

  const projectId = WALLETCONNECT_PROJECT_ID as string;

  const getConfig = (chains: Chain[]) => {
    const { publicClient, webSocketPublicClient } = configureChains(chains, [publicProvider()]);
    return createConfig({
      autoConnect: true,
      connectors: [
        new MetaMaskConnector({ chains }),
        new WalletConnectConnector({ chains, options: { projectId } }),
      ],
      publicClient,
      webSocketPublicClient,
    });
  };

  const defaultConfig = getConfig(chains);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [wagmiConfig, setWagmiConfig] = useState<any>(defaultConfig);

  useEffect(() => {
    const changedCOnfig = getConfig(chains);
    setWagmiConfig(changedCOnfig);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chains]);

  if (!wagmiConfig) return;
  return (
    <WagmiConfig config={wagmiConfig}>
      <ConnectKitProvider>{children}</ConnectKitProvider>
    </WagmiConfig>
  );
};

export default Web3Provider;
