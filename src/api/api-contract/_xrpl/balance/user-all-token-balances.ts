import { useQueries, useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import { AccountInfoResponse, GatewayBalancesResponse } from 'xrpl';

import { useGetTokensQuery } from '~/api/api-server/token/get-tokens';

import { useXrpl } from '~/hooks/contexts';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { IToken, NETWORK } from '~/types';

/**
 * @description Get all token handling in moai finance balances for user
 */
export const useUserAllTokenBalances = () => {
  const { isXrp } = useNetwork();

  const { client, isConnected } = useXrpl();
  const { xrp } = useConnectedWallet();
  const { address: walletAddress } = xrp;

  const { data: tokensData } = useGetTokensQuery(
    {
      queries: {
        filter: 'network:in:xrpl',
      },
    },
    { staleTime: 60 * 1000 }
  );
  const { tokens } = tokensData || {};

  /* get user xrp token balance */
  const xrpTokenBalanceRequest = {
    command: 'account_info',
    account: walletAddress,
  };
  const { data: xrpTokenBalanceData, refetch: xrpTokenBalanceRefetch } =
    useQuery<AccountInfoResponse>(
      ['GET', 'XRPL', 'ACCOUNT_INFO', walletAddress],
      () => client.request(xrpTokenBalanceRequest),
      {
        enabled: !!client && isConnected && !!walletAddress && isXrp,
        staleTime: 1000 * 3,
      }
    );

  const getTokenBalanceRequest = (account: string) => ({
    command: 'gateway_balances',
    account: walletAddress,
    hotWallet: [account],
  });
  const tokenBalancesData = useQueries<GatewayBalancesResponse[]>({
    queries:
      tokens
        ?.filter(
          t => t.network === NETWORK.XRPL && !!t.address && t.symbol !== 'XRP' && !t.isLpToken
        )
        ?.map(token => ({
          queryKey: ['GET', 'XRPL', 'GATEWAY_BALANCES', token.address, walletAddress],
          queryFn: () => client.request(getTokenBalanceRequest(token.address)),
          enabled: !!client && isConnected && !!walletAddress && isXrp,
          staleTime: 1000 * 3,
        })) || [],
  });
  const tokenBalancesRefetch = () => {
    tokenBalancesData.forEach(res => res.refetch());
  };

  const xrpToken = tokens?.find(t => t.symbol === 'XRP');
  const xrpBalance = xrpToken
    ? ([
        {
          ...xrpToken,
          balance: formatUnits(BigInt(xrpTokenBalanceData?.result?.account_data?.Balance || 0), 6),
        },
      ] as (IToken & { balance: string })[])
    : ([] as (IToken & { balance: string })[]);

  const tokenBalances = tokenBalancesData?.flatMap(d => {
    const res: (IToken & { balance: number })[] = [];

    const assets = (d.data as GatewayBalancesResponse)?.result?.assets;
    for (const key in assets) {
      const composition = tokens?.find(token => token.address === key);
      const asset = assets[key];

      if (asset && composition)
        res.push({ ...composition, balance: Number(asset?.[0]?.value || 0) });
    }

    return res;
  });

  const refetch = () => {
    xrpTokenBalanceRefetch();
    tokenBalancesRefetch();
  };

  const userAllTokens = [...xrpBalance, ...tokenBalances] as (IToken & { balance: number })[];

  return {
    userAllTokenBalances: userAllTokens,
    refetch,
  };
};
