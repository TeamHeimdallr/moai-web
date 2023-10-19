import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
// import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { publicProvider } from 'wagmi/providers/public';

// import { WALLETCONNECT_PROJECT_ID } from '~/constants';
import { theRootNetworkTestnet, xrpEvmSidechainTestnet } from '~/configs/evm-network';

interface Props {
  children: React.ReactNode;
}
const Web3Provider = ({ children }: Props) => {
  // const projectId = WALLETCONNECT_PROJECT_ID as string;

  const { publicClient, webSocketPublicClient } = configureChains(
    [theRootNetworkTestnet, xrpEvmSidechainTestnet],
    [publicProvider()]
  );
  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: [
      new InjectedConnector({ chains: [theRootNetworkTestnet, xrpEvmSidechainTestnet] }),
      // new WalletConnectConnector({ chains, options: { projectId } }),
    ],
    publicClient,
    webSocketPublicClient,
  });

  return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>;
};

export default Web3Provider;
