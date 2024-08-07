import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import { AccountInfoResponse } from 'xrpl';

import { useGetTokenQuery } from '~/api/api-server/token/get-token';

import { useXrpl } from '~/hooks/contexts';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';

export const useUserFeeTokenBalance = () => {
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

  const xrpTokenBalance = xrpTokenBalanceData?.result?.account_data?.Balance;
  const ownerCount = xrpTokenBalanceData?.result?.account_data?.OwnerCount;
  const xrpBalance = {
    ...xrpToken,
    balance:
      Number(
        // substract reserve (10XRP + owner count * 2XRP)
        formatUnits(BigInt(xrpTokenBalance || 0), 6)
      ) -
      10 -
      (ownerCount || 0) * 2,
    totalSupply: 0,
  };

  return {
    userXrpBalance: xrpBalance,
    userFeeTokenBalanace: xrpBalance,
    refetch,
    fetchNextPage: () => {},
    hasNextPage: false,
  };
};
