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
  const { data: xrpTokenBalanceData } = useQuery<AccountInfoResponse>(
    ['GET', 'XRPL', 'ACCOUNT_INFO', walletAddress],
    () => client.request(xrpTokenBalanceRequest),
    {
      enabled: !!client && isConnected && !!walletAddress && isXrp,
      staleTime: 1000 * 3,
    }
  );

  const getTokenBalanceRequest = (account: string) => ({
    command: 'gateway_balances',
    account,
    hotWallet: [walletAddress],
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

  const xrpToken = tokens?.find(t => t.symbol === 'XRP');
  const xrpBalance = xrpToken
    ? ([
        {
          ...xrpToken,
          balance: formatUnits(BigInt(xrpTokenBalanceData?.result?.account_data?.Balance || 0), 6),
        },
      ] as (IToken & { balance: string })[])
    : ([] as (IToken & { balance: string })[]);
  const tokenBalances = (tokens?.map((t, i) => {
    const address = t?.address || '';
    const currency = t?.currency || '';

    const asset = (tokenBalancesData[i]?.data as GatewayBalancesResponse)?.result?.assets?.[
      address
    ]?.find(d => d.currency === currency);

    return { ...t, balance: Number(asset?.value || 0) };
  }) || []) as (IToken & { balance: number })[];

  const userAllTokens = [...xrpBalance, ...tokenBalances] as (IToken & { balance: number })[];

  return {
    userAllTokenBalances: userAllTokens,
  };
};
