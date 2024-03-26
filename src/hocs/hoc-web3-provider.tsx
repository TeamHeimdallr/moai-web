import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import { configureChains, createConfig, mainnet, sepolia, WagmiConfig } from 'wagmi';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';

import { WALLETCONNECT_PROJECT_ID } from '~/constants';

import { theRootNetwork, xrpEvmSidechain } from '~/configs/evm-network';

interface Props {
  children: React.ReactNode;
}

const chains = [theRootNetwork, xrpEvmSidechain, mainnet, sepolia];
const projectId = WALLETCONNECT_PROJECT_ID as string;
const { publicClient, webSocketPublicClient } = configureChains(chains, [
  w3mProvider({ projectId }),
]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    ...w3mConnectors({ projectId, chains }),
    new CoinbaseWalletConnector({ options: { appName: 'MOAI_FINANCE' } }),
  ],
  publicClient,
  webSocketPublicClient,
});
const ethereumClient = new EthereumClient(wagmiConfig, chains);

const Web3Provider = ({ children }: Props) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      {children}
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </WagmiConfig>
  );
};

export default Web3Provider;
