interface WithdrawPriceImpactProp {
  id: Address;
  bptIn: number;
}
export const useWithdrawTokenAmounts = ({ id, bptIn }: WithdrawPriceImpactProp) => {
  const { network } = useParams();
  const { selectedNetwork, isEvm } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const { tokenAddress: lpTokenAddress } = EVM_POOL[currentNetwork]?.[0] ?? {};

  const { data: poolTokensData } = usePoolTokens({ id });
  const { data: bptTotalSupply } = usePoolTotalLpTokens({ id });
  const { data: weightData } = usePoolTokenNormalizedWeights({
    lpTokenAddress: lpTokenAddress as Address,
  });
  const normalizedWeights = weightData?.map(v => Number(formatEther(v ?? 0n)) || 0) ?? [];

  const balances = poolTokensData?.[1] || [];

  if (!isEvm)
    return {
      amountsOut: [0, 0],
      priceImpact: 0,
    };

  const { amountsOut, priceImpact } = calcBptInTokenOutAmountAndPriceImpact({
    balances:
      balances.map((v: bigint) => Number(formatUnits(v, TOKEN_DECIMAL[currentNetwork]))) ?? [],
    normalizedWeights,
    bptIn,
    bptTotalSupply: Number(formatEther(bptTotalSupply ?? 0n)),
  });

  return {
    amountsOut,
    priceImpact,
  };
};
