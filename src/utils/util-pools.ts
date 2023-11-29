import { formatEther, parseEther } from 'viem';

import { IToken } from '~/types';

import { BZERO, ONE, SolidityMaths } from './';

interface Props {
  balances: number[];
  normalizedWeights: number[];
  amountsIn: number[];
  bptTotalSupply: number;
  swapFeePercentage: number;
}
export const calcBptOutAmountAndPriceImpact = ({
  balances,
  normalizedWeights,
  amountsIn,
  bptTotalSupply,
  swapFeePercentage,
}: Props) => {
  if (amountsIn.length === 0 || amountsIn.every(v => v === 0)) {
    return {
      bptOut: 0,
      priceImpact: 0,
    };
  }

  // BPT = Balance Pool Token = LP Token
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
  const priceImpact = calcPriceImpact(
    parseEther(bptTotalSupply.toString()),
    amountsIn.map(v => parseEther(v.toString())),
    balances.map(v => parseEther(v.toString())),
    parseEther(bptOut.toString()),
    normalizedWeights.map(v => parseEther(v.toString())),
    true
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

interface CalcBptInTokenOutAmountAndPriceImpactProp {
  balances: number[];
  normalizedWeights: number[];
  bptIn: number;
  bptTotalSupply: number;
}
export const calcBptInTokenOutAmountAndPriceImpact = ({
  balances,
  normalizedWeights,
  bptIn,
  bptTotalSupply,
}: CalcBptInTokenOutAmountAndPriceImpactProp) => {
  if (bptIn === 0) {
    return {
      amountsOut: new Array<number>(balances.length).fill(0),
      priceImpact: 0,
    };
  }
  /**********************************************************************************************
  // computeProportionalAmountsOut                                                             //
  // (per token)                                                                               //
  // aO = tokenAmountOut             /        bptIn         \                                  //
  // b = tokenBalance      a0 = b * | ---------------------  |                                 //
  // bptIn = bptAmountIn             \     bptTotalSupply    /                                 //
  // bpt = bptTotalSupply                                                                      //
  **********************************************************************************************/
  const bptRatio = bptIn / bptTotalSupply;

  const amountsOut = new Array<number>(balances.length).fill(0);
  for (let i = 0; i < balances.length; i++) {
    amountsOut[i] = Number((balances[i] * bptRatio).toFixed(18));
  }

  const priceImpact = calcPriceImpact(
    parseEther(bptTotalSupply.toString()),
    amountsOut.map(v => parseEther(v.toFixed(18).toString())),
    balances.map(v => parseEther(v.toFixed(18).toString())),
    parseEther(bptIn.toFixed(18).toString()),
    normalizedWeights.map(v => parseEther(v.toFixed(18).toString())),
    false
  );

  return {
    amountsOut,
    priceImpact,
  };
};

const calcPriceImpact = (
  bptTotalSupply: bigint,
  tokenAmounts: bigint[],
  balances: bigint[],
  bptAmount: bigint,
  weights: bigint[],
  isJoin: boolean
) => {
  let bptZeroPriceImpact = BZERO;
  for (let i = 0; i < tokenAmounts.length; i++) {
    const price = ((weights?.[i] ?? 0n) * (bptTotalSupply ?? 0n)) / (balances?.[i] || 1n);
    const newTerm = (price * tokenAmounts[i]) / ONE;
    bptZeroPriceImpact += newTerm;
  }

  if (bptZeroPriceImpact === BZERO) return 0;

  if (isJoin) {
    const pi = ONE - SolidityMaths.divDownFixed(bptAmount, bptZeroPriceImpact);
    return pi < 0 ? 0 : 100 * Number(formatEther(pi));
  } else {
    const pi = SolidityMaths.divDownFixed(bptAmount, bptZeroPriceImpact) - ONE;
    return pi < 0 ? 0 : 100 * Number(formatEther(pi));
  }
};

export const formatAmmAssets = (assets: IToken[]) =>
  assets.map(asset => {
    if (asset.symbol === 'XRP')
      return {
        currency: 'XRP',
      };
    return {
      currency: asset.symbol,
      issuer: asset.address,
    };
  });
