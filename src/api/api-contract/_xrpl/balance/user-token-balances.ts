import { useQueries, useQuery } from '@tanstack/react-query';
import { uniqBy } from 'lodash-es';
import { formatUnits } from 'viem';
import { AccountInfoResponse, GatewayBalancesResponse } from 'xrpl';

import { useGetTokensQuery } from '~/api/api-server/token/get-tokens';

import { useXrpl } from '~/hooks/contexts';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { IToken, NETWORK } from '~/types';

type TokenBalance = IToken & { balance: number; totalSupply: number };
interface Props {
  addresses: string[];
}
export const useUserTokenBalances = ({ addresses }: Props) => {
  const { isXrp } = useNetwork();

  const { client, isConnected } = useXrpl();
  const { xrp } = useConnectedWallet();
  const { address: walletAddress } = xrp;

  const { data: tokensData } = useGetTokensQuery(
    { queries: { filter: `address:in:${addresses.join(',')}`, take: 100 } },
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

        if (asset && composition)
          res.push({ ...composition, balance: Number(asset?.value || 0), totalSupply: 0 });
      }

      return res;
    })
    ?.flat();

  const userTokenBalances = uniqBy(userTokenBalancesNotUniq, 'address');
  const tokenBalances = (tokens
    ?.map(t => {
      if (t.symbol === 'XRP') return;

      const balance = userTokenBalances?.find(b => b.address === t.address)?.balance || 0;
      const totalSupply = userTokenBalances?.find(b => b.address === t.address)?.totalSupply || 0;
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
