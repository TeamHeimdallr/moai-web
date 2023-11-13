import { useParams } from 'react-router-dom';
import { useQueries, useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import { AccountInfoResponse, GatewayBalancesResponse } from 'xrpl';

import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';
import { useGetPoolVaultAmmQuery } from '~/api/api-server/pools/get-pool-vault-amm';

import { useXrpl } from '~/hooks/contexts';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { formatAmmAssets } from '~/utils';
import { IAmmInfo, ITokenComposition } from '~/types';

export const useUserPoolTokenBalances = () => {
  const { network, id } = useParams();
  const { isXrp } = useNetwork();

  const { client, isConnected } = useXrpl();
  const { xrp } = useConnectedWallet();
  const { address: walletAddress } = xrp;

  const queryEnabled = !!network && !!id;
  const { data: poolData } = useGetPoolQuery(
    {
      params: {
        networkAbbr: network as string,
        poolId: id as string,
      },
    },
    {
      enabled: queryEnabled,
      staleTime: 1000,
    }
  );
  const { data: poolVaultAmmData } = useGetPoolVaultAmmQuery(
    {
      params: {
        networkAbbr: network as string,
        poolId: id as string,
      },
    },
    {
      enabled: queryEnabled,
      cacheTime: Infinity,
      staleTime: Infinity,
    }
  );

  const { pool } = poolData || {};
  const { compositions, lpToken } = pool || {};

  const { poolVaultAmm } = poolVaultAmmData || {};
  const { ammAssets: ammAssetsRaw } = poolVaultAmm || {};
  const ammAssets = formatAmmAssets(ammAssetsRaw || []);

  /* get amm info, lp token info */
  const ammInfoRequest = {
    command: 'amm_info',
    asset: ammAssets[0],
    asset2: ammAssets[1],
  };
  const { data: ammInfoRaw } = useQuery<IAmmInfo>(
    ['GET', 'XRPL', 'AMM_INFO', ammAssets],
    () => client.request(ammInfoRequest),
    { enabled: !!client && isConnected && !!ammAssets[0] && !!ammAssets[1] && isXrp }
  );
  const ammInfo = ammInfoRaw?.result?.amm;
  const lpTokenInfo = ammInfo?.lp_token;

  /* get user lp token balance */
  const lpTokenBalanceRequest = {
    command: 'gateway_balances',
    account: lpTokenInfo?.issuer,
    hotwallet: [walletAddress],
  };
  const { data: lpTokenBalanceData } = useQuery<GatewayBalancesResponse>(
    ['GET', 'XRPL', 'AMM_INFO', lpTokenInfo?.issuer, walletAddress],
    () => client.request(lpTokenBalanceRequest),
    { enabled: !!client && isConnected && !!lpTokenInfo?.issuer && !!walletAddress && isXrp }
  );

  /* get user xrp token balance */
  const xrpTokenBalanceRequest = {
    command: 'account_info',
    account: walletAddress,
  };
  const { data: xrpTokenBalanceData } = useQuery<AccountInfoResponse>(
    ['GET', 'XRPL', 'ACCOUNT_INFO', walletAddress],
    () => client.request(xrpTokenBalanceRequest),
    { enabled: !!client && isConnected && !!walletAddress && isXrp }
  );

  const getTokenBalanceRequest = (account: string) => ({
    command: 'gateway_balances',
    account,
    hotWallet: [walletAddress],
  });
  const tokenBalancesData = useQueries<GatewayBalancesResponse[]>({
    queries:
      compositions
        ?.filter(token => token.symbol !== 'XRP')
        ?.map(token => ({
          queryKey: ['GET', 'XRPL', 'GATEWAY_BALANCES', token.address, walletAddress],
          queryFn: () => client.request(getTokenBalanceRequest(token.address)),
          enabled: !!client && isConnected && !!token.address && !!walletAddress && isXrp,
        })) || [],
  });

  const lpTokenBalance = Number(
    lpTokenBalanceData?.result?.balances?.[walletAddress]?.find(
      asset => asset?.currency === lpTokenInfo?.currency
    )?.value || 0
  );
  const lpTokenTotalSupply = Number(lpTokenInfo?.value || 0);
  const lpTokenPrice = Number(BigInt(pool?.value || 0) / BigInt(lpTokenTotalSupply));
  const lpTokenValue = lpTokenBalance * lpTokenPrice;

  const xrpTokenBalance = Number(
    formatUnits(BigInt(xrpTokenBalanceData?.result?.account_data?.Balance || 0), 6)
  );
  const tokenBalances = tokenBalancesData?.map((d, i) => {
    const asset = (d.data as GatewayBalancesResponse)?.result?.assets?.[
      compositions?.[i]?.address || ''
    ]?.find(d => d.currency === compositions?.[i]?.symbol);

    return {
      ...compositions?.find(token => token.currency === asset?.currency),
      balance: Number(asset?.value || 0),
    };
  });

  const xrpComposition = compositions?.find(token => token.symbol === 'XRP');
  const userPoolTokens = (
    xrpComposition
      ? [{ ...xrpComposition, balance: xrpTokenBalance }, ...tokenBalances]
      : tokenBalances || []
  ) as (ITokenComposition & { balance: number })[];

  const userPoolTokenTotalValue = userPoolTokens?.reduce((acc, cur) => {
    const tokenValue = (cur?.balance || 0) * (cur?.price || 0);
    return (acc += tokenValue);
  }, 0);

  return {
    pool,
    lpToken,
    lpTokenPrice,
    lpTokenTotalSupply,

    userLpTokenBalance: lpTokenBalance,
    userLpTokenValue: lpTokenValue,

    userPoolTokens,
    userPoolTokenTotalValue,
  };
};
