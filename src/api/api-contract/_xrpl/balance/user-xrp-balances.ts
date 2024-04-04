import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import { AccountInfoResponse } from 'xrpl';

import { useGetTokenQuery } from '~/api/api-server/token/get-token';

import { useXrpl } from '~/hooks/contexts';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';

/**
 * @description Get all token handling in moai finance balances for user
 */
export const useUserXrpBalances = () => {
  const { isXrp } = useNetwork();

  const { client, isConnected } = useXrpl();
  const { xrp } = useConnectedWallet();
  const { address: walletAddress } = xrp;

  const { data: tokensData } = useGetTokenQuery(
    {
      queries: {
        symbol: 'XRP',
        networkAbbr: 'xrpl',
      },
    },
    { staleTime: 10 * 1000 }
  );
  const { token: xrpToken } = tokensData || {};

  /* get user xrp token balance */
  const xrpTokenBalanceRequest = {
    command: 'account_info',
    account: walletAddress,
  };
  const { data: xrpTokenBalanceData, refetch } = useQuery<AccountInfoResponse>(
    ['GET', 'XRPL', 'ACCOUNT_INFO', walletAddress],
    () => client.request(xrpTokenBalanceRequest),
    {
      enabled: !!client && isConnected && !!walletAddress && isXrp,
      staleTime: 1000 * 3,
    }
  );

  const xrpBalance = {
    ...xrpToken,
    balance: Number(
      formatUnits(BigInt(xrpTokenBalanceData?.result?.account_data?.Balance || 0), 6)
    ),
    totalSupply: 0,
  };

  return {
    userXrpBalance: xrpBalance,
    refetch,
    fetchNextPage: () => {},
    hasNextPage: false,
  };
};
