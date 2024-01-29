import { useParams } from 'react-router-dom';
import { useQueries, useQuery } from '@tanstack/react-query';
import { uniqBy } from 'lodash-es';
import { formatUnits, parseUnits } from 'viem';
import { AccountInfoResponse, GatewayBalancesResponse } from 'xrpl';

import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { useXrpl } from '~/hooks/contexts';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { IAmmInfo, ITokenComposition } from '~/types';

interface Props {
  network: string;
  id: string;
}
export const useUserPoolTokenBalances = (props?: Props) => {
  const { network: networkProps, id: idProps } = props || {};
  const { network, id } = useParams();

  const poolId = id || idProps;
  const { isXrp } = useNetwork();

  const { client, isConnected } = useXrpl();
  const { xrp } = useConnectedWallet();
  const { address: walletAddress } = xrp;

  const queryEnabled = !!(network || networkProps) && !!poolId;
  const { data: poolData } = useGetPoolQuery(
    {
      params: {
        networkAbbr: (network || networkProps) as string,
        poolId: poolId as string,
      },
    },
    {
      enabled: queryEnabled,
      staleTime: 1000,
    }
  );

  const { pool } = poolData || {};
  const { compositions, lpToken } = pool || {};

  /* get amm info, lp token info */
  const ammInfoRequest = {
    command: 'amm_info',
    amm_account: (id || idProps) as string,
  };
  const { data: ammInfoRaw, refetch: ammInfoRefetch } = useQuery<IAmmInfo>(
    ['GET', 'XRPL', 'AMM_INFO', poolId],
    () => client.request(ammInfoRequest),
    {
      enabled: !!client && isConnected && !!poolId && isXrp,
      cacheTime: Infinity,
      staleTime: Infinity,
    }
  );
  const ammInfo = ammInfoRaw?.result?.amm;
  const lpTokenInfo = ammInfo?.lp_token;

  /* get user lp token balance */
  const lpTokenBalanceRequest = {
    command: 'gateway_balances',
    account: lpTokenInfo?.issuer,
    hotwallet: [walletAddress],
  };
  const { data: lpTokenBalanceData, refetch: lpTokenBalanceRefetch } =
    useQuery<GatewayBalancesResponse>(
      ['GET', 'XRPL', 'GATEWAY_BALANCES', lpTokenInfo?.issuer, walletAddress],
      () => client.request(lpTokenBalanceRequest),
      {
        enabled: !!client && isConnected && !!lpTokenInfo?.issuer && !!walletAddress && isXrp,
        staleTime: 1000 * 3,
      }
    );

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
      compositions
        ?.filter(token => token.symbol !== 'XRP')
        ?.map(token => ({
          queryKey: ['GET', 'XRPL', 'GATEWAY_BALANCES', token.address, walletAddress],
          queryFn: () => client.request(getTokenBalanceRequest(token.address)),
          enabled: !!client && isConnected && !!token.address && !!walletAddress && isXrp,
          staleTime: 1000 * 3,
        })) || [],
  });
  const tokenBalancesRefetch = () => {
    tokenBalancesData.forEach(res => res.refetch());
  };

  const _lpTokenBalanceRaw =
    lpTokenBalanceData?.result?.balances?.[walletAddress]?.find(
      asset => asset?.currency === lpTokenInfo?.currency
    )?.value || '0';
  const lpTokenBalance = Number(_lpTokenBalanceRaw);

  // do not use
  const lpTokenBalanceRaw = parseUnits(lpTokenBalance.toFixed(18), 18);

  const lpTokenTotalSupply = Number(lpTokenInfo?.value || 0);
  const lpTokenPrice = lpTokenTotalSupply ? Number((pool?.value || 0) / lpTokenTotalSupply) : 0;
  const lpTokenValue = lpTokenBalance * lpTokenPrice;

  const xrpTokenBalance = Number(
    formatUnits(BigInt(xrpTokenBalanceData?.result?.account_data?.Balance || 0), 6)
  );
  const tokenBalancesNotUniq = tokenBalancesData
    ?.flatMap(d => {
      const res: (ITokenComposition & { balance: number })[] = [];

      const assets = (d.data as GatewayBalancesResponse)?.result?.assets;
      for (const key in assets) {
        const composition = compositions?.find(
          token => token.address.toLocaleLowerCase() === key.toLocaleLowerCase()
        );
        const [asset] = assets[key];

        if (asset && composition) res.push({ ...composition, balance: Number(asset?.value || 0) });
      }

      return res;
    })
    .flat();

  const tokenBalances = uniqBy(tokenBalancesNotUniq, 'address');
  const xrpComposition = compositions?.find(token => token.symbol === 'XRP');
  const userPoolTokens = (
    xrpComposition
      ? [
          {
            ...xrpComposition,
            balance: xrpTokenBalance,
            balanceRaw: parseUnits(xrpTokenBalance.toString(), 6),
          },
          ...tokenBalances,
        ]
      : tokenBalances || []
  ) as (ITokenComposition & { balance: number; balanceRaw: bigint })[];

  const userPoolTokenTotalValue = userPoolTokens?.reduce((acc, cur) => {
    const tokenValue = (cur?.balance || 0) * (cur?.price || 0);
    return (acc += tokenValue);
  }, 0);

  const refetch = () => {
    ammInfoRefetch();
    lpTokenBalanceRefetch();
    xrpTokenBalanceRefetch();
    tokenBalancesRefetch();
  };

  return {
    pool,
    lpToken,
    lpTokenPrice,
    lpTokenTotalSupply,

    userLpTokenBalance: lpTokenBalance,
    userLpTokenBalanceRaw: lpTokenBalanceRaw,

    userLpTokenValue: lpTokenValue,

    userPoolTokens,
    userPoolTokenTotalValue,

    refetch,
  };
};
