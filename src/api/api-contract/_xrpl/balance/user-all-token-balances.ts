import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import { AccountInfoResponse, AccountLinesResponse } from 'xrpl';

import { useGetTokensInfinityQuery } from '~/api/api-server/token/get-tokens';

import { useXrpl } from '~/hooks/contexts';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { IToken } from '~/types';

/**
 * @description Get all token handling in moai finance balances for user
 */
type TokenBalance = IToken & { balance: number; totalSupply: number };
export const useUserAllTokenBalances = () => {
  const { isXrp } = useNetwork();

  const { client, isConnected } = useXrpl();
  const { xrp } = useConnectedWallet();
  const { address: walletAddress } = xrp;

  const {
    data: tokensData,
    hasNextPage,
    fetchNextPage,
  } = useGetTokensInfinityQuery(
    { queries: { filter: 'network:in:xrpl', take: 500 } },
    { staleTime: 10 * 1000 }
  );
  const tokens = tokensData?.pages?.flatMap(p => p.tokens) || [];

  const others = tokens?.filter(t => t.symbol !== 'XRP');

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

  const accountLineRequest = {
    command: 'account_lines',
    account: walletAddress || '',
  };
  const { data: accountLines } = useQuery<AccountLinesResponse>(
    ['GET', 'XRPL', 'ACCOUNT_LINES', walletAddress],
    () => client.request(accountLineRequest),
    {
      enabled: !!client && isConnected && !!walletAddress && isXrp,
      staleTime: 1000 * 3,
    }
  );

  const otherBalances =
    others?.map(token => {
      const accountLine = accountLines?.result?.lines?.find(
        line =>
          line.account === token.address &&
          line.currency.toLocaleLowerCase() === token.currency.toLocaleLowerCase()
      );
      const calcBalance = Number(accountLine?.balance || '0');

      const res = {
        ...token,
        balance: calcBalance,
        totalSupply: 0,
      };

      return res;
    }) || [];

  // const lpTokens = tokens?.filter(
  //   t => t.network === NETWORK.XRPL && !!t.address && t.symbol !== 'XRP' && t.isLpToken
  // );
  // const getLpTokenTotalSupply = (account: string) => ({
  //   command: 'gateway_balances',
  //   account: account,
  // });
  // const lpTokenTotalSupplyData = useQueries<GatewayBalancesResponse[]>({
  //   queries:
  //     lpTokens?.map(token => ({
  //       queryKey: ['GET', 'XRPL', 'GATEWAY_BALANCES', 'LP_TOKEN', token.address],
  //       queryFn: () => client.request(getLpTokenTotalSupply(token.address)),
  //       enabled: !!client && isConnected && isXrp,
  //       staleTime: 1000 * 3,
  //     })) || [],
  // });

  // const lpTokenTotalSupplyRaw = lpTokenTotalSupplyData?.flatMap(d => {
  //   const supply = (d.data as GatewayBalancesResponse)?.result?.obligations;
  //   const currencies = Object.keys(supply || {});

  //   return [
  //     ...currencies.map(currency => ({
  //       currency,
  //       supply: Number(supply?.[currency] || 0),
  //     })),
  //   ];
  // });

  // const getTokenBalanceRequest = (account: string) => ({
  //   command: 'gateway_balances',
  //   account: walletAddress,
  //   hotWallet: [account],
  // });
  // const tokenBalancesData = useQueries<GatewayBalancesResponse[]>({
  //   queries:
  //     tokens
  //       ?.filter(
  //         t => t.network === NETWORK.XRPL && !!t.address && t.symbol !== 'XRP' && !t.isLpToken
  //       )
  //       ?.map(token => ({
  //         queryKey: ['GET', 'XRPL', 'GATEWAY_BALANCES', token.address, walletAddress],
  //         queryFn: () => client.request(getTokenBalanceRequest(token.address)),
  //         enabled: !!client && isConnected && !!walletAddress && isXrp,
  //         staleTime: 1000 * 3,
  //       })) || [],
  // });

  // const tokenBalancesRefetch = () => {
  //   tokenBalancesData.forEach(res => res.refetch());
  // };

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
            ) === 0
              ? 0
              : Number(
                  // substract reserve (10XRP + owner count * 2XRP)
                  formatUnits(BigInt(xrpTokenBalance || 0), 6)
                ) -
                10 -
                (ownerCount || 0) * 2,
          totalSupply: 0,
        },
      ] as IToken & TokenBalance[])
    : ([] as (IToken & TokenBalance)[]);

  // const userTokenBalancesNotUniq = tokenBalancesData
  //   ?.flatMap(d => {
  //     const res: TokenBalance[] = [];

  //     const assets = (d.data as GatewayBalancesResponse)?.result?.assets;
  //     for (const key in assets) {
  //       const asset = assets[key];

  //       asset?.forEach(a => {
  //         const composition = tokens?.find(
  //           token => token.address === key && token.currency === a?.currency
  //         );

  //         const totalSupply =
  //           lpTokenTotalSupplyRaw?.find(supply => supply.currency === a?.currency)?.supply || 0;

  //         if (asset && composition)
  //           res.push({ ...composition, balance: Math.abs(Number(a?.value || 0)), totalSupply });
  //       });
  //     }

  //     return res;
  //   })
  //   .flat();

  // const userTokenBalances = uniqWith(
  //   userTokenBalancesNotUniq,
  //   (a, b) => `${a.currency}-${a.address}` === `${b.currency}-${b.address}`
  // );
  // const tokenBalances = (tokens
  //   ?.map(t => {
  //     if (t.symbol === 'XRP') return;

  //     const balance =
  //       userTokenBalances?.find(b => b.address === t.address && b.currency === t.currency)
  //         ?.balance || 0;
  //     const totalSupply =
  //       userTokenBalances?.find(b => b.address === t.address && b.currency === t.currency)
  //         ?.totalSupply || 0;
  //     return {
  //       ...t,
  //       balance,
  //       totalSupply,
  //     } as IToken & TokenBalance;
  //   })
  //   .filter(c => !!c) || []) as (IToken & TokenBalance)[];

  const refetch = () => {
    if (!walletAddress) return;

    xrpTokenBalanceRefetch();
    // tokenBalancesRefetch();
  };

  const userAllTokens = [...xrpBalance, ...otherBalances]
    .filter(t => !!t)
    .sort((a, b) => a?.symbol?.localeCompare(b?.symbol || '') || 0) as (IToken & TokenBalance)[];

  return {
    userAllTokenBalances: userAllTokens,
    refetch,
    fetchNextPage,
    hasNextPage,
  };
};
