import { useQueries, useQuery } from '@tanstack/react-query';
import { GatewayBalancesResponse } from 'xrpl';

import { useXrpl } from '~/hooks/contexts';
import { useNetwork } from '~/hooks/contexts/use-network';

interface Props {
  lpToken: string;
  user: string;
}
export const useUserLpTokenBalance = ({ lpToken, user }: Props) => {
  const { isXrp } = useNetwork();
  const { client, isConnected } = useXrpl();

  const getTokenBalanceRequest = {
    command: 'gateway_balances',
    account: user,
    hotWallet: lpToken,
  };

  const { data, ...rest } = useQuery<GatewayBalancesResponse>({
    queryKey: ['GET', 'XRPL', 'GATEWAY_BALANCE', lpToken, user],
    queryFn: () => client.request(getTokenBalanceRequest),
    enabled: !!client && isConnected && !!lpToken && !!user && isXrp,
  });
  const assets = data?.result?.assets;
  const balance = Number(assets?.[lpToken]?.[0]?.value || '0');

  return {
    data: balance,
    ...rest,
  };
};

interface UsersProps {
  lpToken: string;
  users: string[];
}
export const useUsersLpTokenBalance = ({ lpToken, users }: UsersProps) => {
  const { isXrp } = useNetwork();
  const { client, isConnected } = useXrpl();

  const getTokenBalanceRequest = (user: string) => ({
    command: 'gateway_balances',
    account: user,
    hotWallet: lpToken,
  });

  const result = useQueries<GatewayBalancesResponse[]>({
    queries: users.map(user => ({
      queryKey: ['GET', 'XRPL', 'GATEWAY_BALANCE', lpToken, user],
      queryFn: () => client.request(getTokenBalanceRequest(user)),
      enabled: !!client && isConnected && !!lpToken && !!user && isXrp,
    })),
  });

  const data = result?.map(res => {
    const data = (res?.data as GatewayBalancesResponse)?.result;
    return {
      account: data?.account,
      balance: Number(data?.assets?.[lpToken]?.[0]?.value || '0'),
    };
  });

  return {
    data,
  };
};
