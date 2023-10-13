import { useEffect, useState } from 'react';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';

import { WALLETCONNECT_PROJECT_ID } from '~/constants';

import { useEvmChain } from '~/hooks/contexts';
import { useSelecteNetworkStore } from '~/states/data';

interface Props {
  children: React.ReactNode;
}
// TODO: change to connect kit
const Web3Provider = ({ children }: Props) => {
  const { selectedNetwork } = useSelecteNetworkStore();
  const { chains } = useEvmChain();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [wagmiConfig, setWagmiConfig] = useState<any>();
  const [ethereumClient, setEthereumClient] = useState<EthereumClient>();

  const projectId = WALLETCONNECT_PROJECT_ID;

  useEffect(() => {
    const { publicClient, webSocketPublicClient } = configureChains(chains, [
      w3mProvider({ projectId }),
    ]);

    const wagmiConfig = createConfig({
      autoConnect: true,
      connectors: w3mConnectors({ projectId, chains }),
      publicClient,
      webSocketPublicClient,
    });

    const ethereumClient = new EthereumClient(wagmiConfig, chains);

    setWagmiConfig(wagmiConfig);
    setEthereumClient(ethereumClient);
  }, [projectId, selectedNetwork, chains]);

  return (
    <>
      <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>
      <Web3Modal
        projectId={projectId}
        ethereumClient={ethereumClient}
        themeVariables={{
          '--w3m-accent-color': '#23263A',
          '--w3m-font-family': 'Pretendard Variable',
          '--w3m-text-medium-regular-size': '14px',
          '--w3m-text-medium-regular-weight': '500',
          '--w3m-text-medium-regular-line-height': '22px',
        }}
      />
    </>
  );
};

export default Web3Provider;
