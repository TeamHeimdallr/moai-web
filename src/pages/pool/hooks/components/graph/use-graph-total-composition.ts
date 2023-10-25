import { useLiquidityPoolBalance } from '~/api/api-contract/pool/get-liquidity-pool-balance';

export const useGraphTotalComposition = (id: string) => {
  const {
    pool: { compositions, value: poolTotalValue },
  } = useLiquidityPoolBalance(id);

  const poolData = compositions?.map(composition => {
    const { address, symbol, balance: compositionBalance, price, weight } = composition;
    const balance = compositionBalance ?? 0;

    return {
      id: address,
      address,
      symbol,
      weight,
      value: balance * (price ?? 0),
      currentWeight: ((balance * (price ?? 0)) / poolTotalValue) * 100,

      balance,
    };
  });
  return { poolData };
};
