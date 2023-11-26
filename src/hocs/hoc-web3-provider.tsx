import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';

import { WALLETCONNECT_PROJECT_ID } from '~/constants';

import { theRootNetwork, xrpEvmSidechain } from '~/configs/evm-network';

interface Props {
  children: React.ReactNode;
}

const chains = [theRootNetwork, xrpEvmSidechain];
const projectId = WALLETCONNECT_PROJECT_ID as string;
const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
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
