import { useQueries, useQuery } from '@tanstack/react-query';
import { uniqWith } from 'lodash-es';
import { formatUnits } from 'viem';
import { AccountInfoResponse, GatewayBalancesResponse } from 'xrpl';

import { useGetTokensQuery } from '~/api/api-server/token/get-tokens';

import { useXrpl } from '~/hooks/contexts';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { IToken, NETWORK } from '~/types';

type TokenBalance = IToken & { balance: number; totalSupply: number };
interface Props {
  targetTokens: {
    issuer: string;
    currency: string;
  }[];
}
export const useUserTokenBalances = ({ targetTokens }: Props) => {
  const { isXrp } = useNetwork();

  const { client, isConnected } = useXrpl();
  const { xrp } = useConnectedWallet();
  const { address: walletAddress } = xrp;

  const addresses = targetTokens.map(t => t.issuer);
  const currencies = targetTokens.map(t => t.currency);

  const { data: tokensData } = useGetTokensQuery(
    {
      queries: { filter: `address:in:${addresses.join(',')}_currency:in:${currencies}`, take: 100 },
    },
    { staleTime: 10 * 1000, enabled: !!addresses && addresses.length > 0 }
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
  const xrpTokenBalance = xrpTokenBalanceData?.result?.account_data?.Balance;
  const ownerCount = xrpTokenBalanceData?.result?.account_data?.OwnerCount;
  const xrpBalance = xrpToken
    ? ([
        {
          ...xrpToken,
          balance:
            Number(
              // substract reserve (10XRP + owner count * 2XRP)
              formatUnits(BigInt(xrpTokenBalance || 0), 6)
            ) -
            10 -
            (ownerCount || 0) * 2,
          totalSupply: 0,
        },
      ] as IToken & TokenBalance[])
    : ([] as (IToken & TokenBalance)[]);

  const userTokenBalancesNotUniq = tokenBalancesData
    ?.flatMap(d => {
      const res: TokenBalance[] = [];

      const assets = (d.data as GatewayBalancesResponse)?.result?.assets;
      for (const key in assets) {
        const asset = assets[key];

        asset?.forEach(a => {
          const composition = tokens?.find(
            token => token.address === key && token.currency === a?.currency
          );

          if (asset && composition)
            res.push({ ...composition, balance: Math.abs(Number(a?.value || 0)), totalSupply: 0 });
        });
      }

      return res;
    })
    ?.flat();

  const userTokenBalances = uniqWith(
    userTokenBalancesNotUniq,
    (a, b) => `${a.currency}-${a.address}` === `${b.currency}-${b.address}`
  );
  const tokenBalances = (tokens
    ?.map(t => {
      if (t.symbol === 'XRP') return;

      const balance =
        userTokenBalances?.find(b => b.address === t.address && b.currency === t.currency)
          ?.balance || 0;
      const totalSupply =
        userTokenBalances?.find(b => b.address === t.address && b.currency === t.currency)
          ?.totalSupply || 0;
      return {
        ...t,
        balance,
        totalSupply,
      } as IToken & TokenBalance;
    })
    .filter(c => !!c) || []) as (IToken & TokenBalance)[];

  const refetch = () => {
    if (!walletAddress) return;

    xrpTokenBalanceRefetch();
    tokenBalancesRefetch();
  };

  const userTokens = [...xrpBalance, ...tokenBalances]
    .filter(t => !!t)
    .sort((a, b) => a?.symbol?.localeCompare(b?.symbol || '') || 0) as (IToken & TokenBalance)[];

  return {
    userTokenBalances: userTokens,
    refetch,
  };
};
