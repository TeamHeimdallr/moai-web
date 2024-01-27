import { useQuery } from '@tanstack/react-query';

import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { useXrpl } from '~/hooks/contexts';
import { useNetwork } from '~/hooks/contexts/use-network';
import { IAmmInfo, NETWORK } from '~/types';

interface Props {
  network: NETWORK;
  poolId: string;
}
export const useLpTokenTotalSupply = ({ network, poolId }: Props) => {
  const { isXrp } = useNetwork();

  const { client, isConnected } = useXrpl();

  const queryEnabled = !!network && !!poolId;
  const { data: poolData } = useGetPoolQuery(
    {
      params: {
        networkAbbr: network as string,
        poolId: poolId,
      },
    },
    {
      enabled: queryEnabled,
      staleTime: 1000,
    }
  );

  const { pool } = poolData || {};

  /* get amm info, lp token info */
  const ammInfoRequest = {
    command: 'amm_info',
    amm_account: poolId as string,
  };
  const { data: ammInfoRaw } = useQuery<IAmmInfo>(
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

  const lpTokenTotalSupply = Number(lpTokenInfo?.value || 0);
  const lpTokenPrice = lpTokenTotalSupply ? Number((pool?.value || 0) / lpTokenTotalSupply) : 0;

  return {
    lpTokenPrice,
    lpTokenTotalSupply,
  };
};
