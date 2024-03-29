import { useParams } from 'react-router-dom';
import { useQuery } from 'wagmi';

import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { useXrpl } from '~/hooks/contexts';
import { useNetwork } from '~/hooks/contexts/use-network';
import { IAmmInfo, ITokenComposition } from '~/types';

interface WithdrawPriceImpactProp {
  bptIn: number;
}
export const useCalculateWithdrawLiquidity = ({ bptIn }: WithdrawPriceImpactProp) => {
  const { network, id } = useParams();
  const { isXrp } = useNetwork();

  const { client, isConnected } = useXrpl();

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

  const { pool } = poolData || {};
  const { compositions } = pool || {};

  /* get amm info, lp token info */
  const ammInfoRequest = {
    command: 'amm_info',
    amm_account: id as string,
  };
  const { data: ammInfoRaw } = useQuery<IAmmInfo>(
    ['GET', 'XRPL', 'AMM_INFO', id],
    () => client.request(ammInfoRequest),
    {
      enabled: !!client && isConnected && !!id && isXrp,
      cacheTime: Infinity,
      staleTime: Infinity,
    }
  );
  const ammInfo = ammInfoRaw?.result?.amm;
  const lpTokenInfo = ammInfo?.lp_token;

  const lpTokenTotalSupply = Number(lpTokenInfo?.value || 0);
  const withdrawLpTokenWeight = lpTokenTotalSupply ? bptIn / lpTokenTotalSupply : 0;

  const proportionalTokensOut = (compositions?.map(p => ({
    ...p,
    amount: withdrawLpTokenWeight * (p?.balance || 0),
  })) || []) as (ITokenComposition & { amount: number })[];

  return {
    proportionalTokensOut,
    priceImpact: 0,
  };
};
