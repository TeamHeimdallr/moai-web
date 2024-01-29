import { useQueries, useQuery } from '@tanstack/react-query';
import { uniqBy } from 'lodash-es';
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
type TokenBalance = IToken & { balance: number; totalSupply: number };
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

  const lpTokens = tokens?.filter(
    t => t.network === NETWORK.XRPL && !!t.address && t.symbol !== 'XRP' && t.isLpToken
  );
  const getLpTokenTotalSupply = (account: string) => ({
    command: 'gateway_balances',
    account: account,
  });
  const lpTokenTotalSupplyData = useQueries<GatewayBalancesResponse[]>({
    queries:
      lpTokens?.map(token => ({
        queryKey: ['GET', 'XRPL', 'GATEWAY_BALANCES', 'LP_TOKEN', token.address],
        queryFn: () => client.request(getLpTokenTotalSupply(token.address)),
        enabled: !!client && isConnected && isXrp,
        staleTime: 1000 * 3,
      })) || [],
  });

  const lpTokenTotalSupplyRaw = lpTokenTotalSupplyData?.flatMap(d => {
    const supply = (d.data as GatewayBalancesResponse)?.result?.obligations;
    const currencies = Object.keys(supply || {});

    return [
      ...currencies.map(currency => ({
        currency,
        supply: Number(supply?.[currency] || 0),
      })),
    ];
  });

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
          balance: Number(
            formatUnits(BigInt(xrpTokenBalanceData?.result?.account_data?.Balance || 0), 6)
          ),
          totalSupply: 0,
        },
      ] as IToken & TokenBalance[])
    : ([] as (IToken & TokenBalance)[]);

  const userTokenBalancesNotUniq = tokenBalancesData
    ?.flatMap(d => {
      const res: TokenBalance[] = [];

      const assets = (d.data as GatewayBalancesResponse)?.result?.assets;
      for (const key in assets) {
        const composition = tokens?.find(token => token.address === key);
        const [asset] = assets[key];

        const totalSupply =
          lpTokenTotalSupplyRaw?.find(supply => supply.currency === asset?.currency)?.supply || 0;

        if (asset && composition)
          res.push({ ...composition, balance: Number(asset?.value || 0), totalSupply });
      }

      return res;
    })
    .flat();

  const userTokenBalances = uniqBy(userTokenBalancesNotUniq, 'address');
  const tokenBalances =
    tokens?.map(t => {
      if (t.symbol === 'XRP') return;

      const balance = userTokenBalances?.find(b => b.address === t.address)?.balance || 0;
      const totalSupply = userTokenBalances?.find(b => b.address === t.address)?.totalSupply || 0;
      return {
        ...t,
        balance,
        totalSupply,
      } as IToken & TokenBalance;
    }) || ([] as (IToken & TokenBalance)[]);

  const refetch = () => {
    xrpTokenBalanceRefetch();
    tokenBalancesRefetch();
  };

  const userAllTokens = [...xrpBalance, ...tokenBalances].filter(t => !!t) as (IToken &
    TokenBalance)[];

  return {
    userAllTokenBalances: userAllTokens,
    refetch,
  };
};
