import { useQuery } from '@tanstack/react-query';

import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';
import { useGetPoolVaultAmmQuery } from '~/api/api-server/pools/get-pool-vault-amm';

import { useXrpl } from '~/hooks/contexts';
import { useNetwork } from '~/hooks/contexts/use-network';
import { formatAmmAssets } from '~/utils';
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
  const { data: poolVaultAmmData } = useGetPoolVaultAmmQuery(
    {
      params: {
        networkAbbr: network as string,
        poolId: poolId,
      },
    },
    {
      enabled: queryEnabled,
      cacheTime: Infinity,
      staleTime: Infinity,
    }
  );

  const { pool } = poolData || {};
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
    {
      enabled: !!client && isConnected && !!ammAssets[0] && !!ammAssets[1] && isXrp,
      cacheTime: Infinity,
      staleTime: Infinity,
    }
  );
  const ammInfo = ammInfoRaw?.result?.amm;
  const lpTokenInfo = ammInfo?.lp_token;

  const lpTokenTotalSupply = Number(lpTokenInfo?.value || 0);
  const lpTokenPrice = Number(BigInt(pool?.value || 0) / BigInt(lpTokenTotalSupply));

  return {
    lpTokenPrice,
    lpTokenTotalSupply,
  };
};
