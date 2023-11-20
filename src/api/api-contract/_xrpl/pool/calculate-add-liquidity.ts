interface Props {
  amountsIn: number[];
}

export const useCalculateAddLiquidity = ({ amountsIn }: Props) => {
  if (!amountsIn[0] || !amountsIn[1])
    return {
      bptOut: 0,
      priceImpact: 0,
    };

  const bptOut = Math.sqrt(amountsIn[0] * amountsIn[0] + amountsIn[1] * amountsIn[1]).toFixed(6);

  return {
    bptOut: Number(bptOut),
    priceImpact: 0,
  };
};
