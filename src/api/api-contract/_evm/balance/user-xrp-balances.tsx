import { useParams } from 'react-router-dom';
import { Address } from 'viem';
import { useBalance } from 'wagmi';

import { useGetTokenQuery } from '~/api/api-server/token/get-token';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr, getNetworkFull } from '~/utils';

export const useUserXrpBalances = () => {
  const { network } = useParams();
  const { selectedNetwork, isFpass } = useNetwork();
  const { evm, fpass } = useConnectedWallet();
  const { address: walletAddress } = isFpass ? fpass : evm;

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);
  const chainId = useNetworkId(currentNetwork);

  const { data: nativeBalance, refetch } = useBalance({
    address: walletAddress as Address,
    chainId,
  });

  const { data: tokensData } = useGetTokenQuery(
    {
      queries: {
        symbol: 'XRP',
        networkAbbr: currentNetworkAbbr,
      },
    },
    { staleTime: 10 * 1000 }
  );
  const { token } = tokensData || {};

  return {
    userXrpBalance: {
      ...token,
      balance: Number(nativeBalance?.formatted || '0'),
      totalSupply: 0,
    },
    refetch,
    fetchNextPage: () => {},
    hasNextPage: false,
  };
};
