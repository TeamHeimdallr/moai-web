import { formatEther, parseEther } from 'viem';

import { BZERO, ONE, SolidityMaths } from './solidityMaths';

interface Props {
  balances: number[];
  normalizedWeights: number[];
  amountsIn: number[];
  bptTotalSupply: number;
  swapFeePercentage: number;
}
export const calcBptOutGivenExactTokensIn = ({
  balances,
  normalizedWeights,
  amountsIn,
  bptTotalSupply,
  swapFeePercentage,
}: Props) => {
  if (amountsIn.every(v => v === 0)) {
    return {
      bptOut: 0,
      priceImpact: 0,
    };
  }

  // BPT out, so we round down overall.
  const balanceRatiosWithFee: number[] = new Array<number>(amountsIn.length);

  let invariantRatioWithFees = 0;
  for (let i = 0; i < balances.length; i++) {
    balanceRatiosWithFee[i] = (balances[i] + amountsIn[i]) / balances[i];
    invariantRatioWithFees += balanceRatiosWithFee[i] * normalizedWeights[i];
  }

  const invariantRatio = _computeJoinExactTokensInInvariantRatio(
    balances,
    normalizedWeights,
    amountsIn,
    balanceRatiosWithFee,
    invariantRatioWithFees,
    swapFeePercentage
  );

  const bptOut = invariantRatio > 1 ? bptTotalSupply * (invariantRatio - 1) : 0;
  const priceImpact = calcJoinPoolPriceImpact(
    parseEther(bptTotalSupply.toString()),
    amountsIn.map(v => parseEther(v.toString())),
    balances.map(v => parseEther(v.toString())),
    parseEther(bptOut.toString()),
    normalizedWeights.map(v => parseEther(v.toString()))
  );

  return {
    bptOut,
    priceImpact,
  };
};

const _computeJoinExactTokensInInvariantRatio = (
  balances: number[],
  normalizedWeights: number[],
  amountsIn: number[],
  balanceRatiosWithFee: number[],
  invariantRatioWithFees: number,
  swapFeePercentage: number
) => {
  // Swap fees are charged on all tokens that are being added in a larger proportion than the overall invariant
  // increase.
  let invariantRatio = 1;

  for (let i = 0; i < balances.length; i++) {
    let amountInWithoutFee: number;

    if (balanceRatiosWithFee[i] > invariantRatioWithFees) {
      // invariantRatioWithFees might be less than 1 in edge scenarios due to rounding error,
      // particularly if the weights don't exactly add up to 100%.
      const nonTaxableAmount =
        invariantRatioWithFees > 1 ? balances[i] * (invariantRatioWithFees - 1) : 0;
      const swapFee = (amountsIn[i] - nonTaxableAmount) * swapFeePercentage;
      amountInWithoutFee = amountsIn[i] - swapFee;
    } else {
      amountInWithoutFee = amountsIn[i];

      // If a token's amount in is not being charged a swap fee then it might be zero (e.g. when joining a
      // Pool with only a subset of tokens). In this case, `balanceRatio` will equal 1, and
      // the `invariantRatio` will not change at all. We therefore skip to the next iteration, avoiding
      // the costly `pow` call.
      if (amountInWithoutFee === 0) {
        continue;
      }
    }

    const balanceRatio = (balances[i] + amountInWithoutFee) / balances[i];

    invariantRatio *= Math.pow(balanceRatio, normalizedWeights[i]);
  }

  return invariantRatio;
};

const calcJoinPoolPriceImpact = (
  bptTotalSupply: bigint,
  tokenAmounts: bigint[],
  balances: bigint[],
  bptOut: bigint,
  weights: bigint[]
) => {
  let bptZeroPriceImpact = BZERO;
  for (let i = 0; i < tokenAmounts.length; i++) {
    const price = (weights[i] * bptTotalSupply) / balances[i];
    const newTerm = (price * tokenAmounts[i]) / ONE;
    bptZeroPriceImpact += newTerm;
  }

  const pi = ONE - SolidityMaths.divDownFixed(bptOut, bptZeroPriceImpact);
  return pi < 0 ? 0 : 100 * Number(formatEther(pi));
};
