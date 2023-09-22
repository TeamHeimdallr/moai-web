import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { WagmiConfig } from 'wagmi';

import { ethereumClient, projectId, wagmiConfig } from '~/configs/setup-evm-wallet';

const Web3Modal = lazy(() =>
  import('@web3modal/react').then(({ Web3Modal }) => ({ default: Web3Modal }))
);

const queryClient = new QueryClient();

interface Props {
  children: React.ReactNode;
}
const Web3Provider = ({ children }: Props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>
      <Suspense fallback={<></>}>
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
      </Suspense>
    </QueryClientProvider>
  );
};

export default Web3Provider;
