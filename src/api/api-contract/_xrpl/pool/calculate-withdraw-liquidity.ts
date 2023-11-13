interface WithdrawPriceImpactProp {
  id: string;
  amountIn: number;
}
export const useWithdrawTokenAmounts = ({ id, amountIn }: WithdrawPriceImpactProp) => {
  const { ammInfo } = useAmmInfo(id);
  const { token1, token2, liquidityPoolToken } = ammInfo;

  const poolTokens = [token1, token2];

  const withdrawLpTokenWeight = liquidityPoolToken?.balance
    ? amountIn / liquidityPoolToken.balance
    : 0;

  const amountsOut = poolTokens?.map(p => withdrawLpTokenWeight * (p?.balance ?? 0));

  return {
    amountsOut,
    priceImpact: 0,
  };
};
