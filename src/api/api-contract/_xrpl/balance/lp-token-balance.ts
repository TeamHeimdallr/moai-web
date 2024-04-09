import { useQuery } from '@tanstack/react-query';
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
