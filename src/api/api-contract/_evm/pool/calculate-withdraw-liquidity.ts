import { useParams } from 'react-router-dom';

import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { useNetwork } from '~/hooks/contexts/use-network';
import { calcBptInTokenOutAmountAndPriceImpact } from '~/utils';
import { ITokenComposition } from '~/types';

import { useUserPoolTokenBalances } from '../balance/user-pool-token-balances';

interface WithdrawPriceImpactProp {
  bptIn: number;
}
export const useCalculateWithdrawLiquidity = ({ bptIn }: WithdrawPriceImpactProp) => {
  const { network, id } = useParams();
  const { isEvm } = useNetwork();

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
  const { pool } = poolData ?? {};
  const { compositions } = pool || {};
  const { lpTokenTotalSupply } = useUserPoolTokenBalances();

  if (!isEvm)
    return {
      amountsOut: [0, 0],
      priceImpact: 0,
    };

  const { amountsOut: proportionalAmountsOut, priceImpact } = calcBptInTokenOutAmountAndPriceImpact(
    {
      balances: compositions?.map(c => c.balance || 0) ?? [],
      normalizedWeights: compositions?.map(c => c.currentWeight || 0) ?? [],
      bptIn,
      bptTotalSupply: lpTokenTotalSupply,
    }
  );
  const proportionalTokensOut = (compositions?.map((c, i) => ({
    ...c,
    amount: proportionalAmountsOut[i],
  })) || []) as (ITokenComposition & { amount: number })[];

  return {
    proportionalTokensOut,
    priceImpact,
  };
};
