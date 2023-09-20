import { formatUnits } from 'viem';
import * as yup from 'yup';

import { usePoolTokens } from '~/api/api-contract/pool/get-liquidity-pool-balance';
import { CHAIN, POOL_ID, TOKEN_ADDRESS } from '~/constants';
import { useBalancesAll } from '~/hooks/data/use-balance-all';
import { HOOK_FORM_KEY } from '~/types/components';

import { useSwapStore } from '../states/swap';

export const useSwapData = () => {
  const isRoot = CHAIN === 'root';
  const decimals = isRoot ? 6 : 18;

  const { balancesMap } = useBalancesAll();

  const poolId = CHAIN === 'root' ? POOL_ID.ROOT_XRP : POOL_ID.POOL_A;

  const { data: poolReserve } = usePoolTokens(poolId, true);

  const {
    fromToken,
    fromValue,
    toToken,

    setFromToken,
    setFromValue,
    setToToken,
    resetFromValue,
    resetAll,
  } = useSwapStore();

  // TODO: 3 pool case
  const fromReserve =
    poolReserve?.[0]?.[0] === TOKEN_ADDRESS[fromToken]
      ? Number(formatUnits(poolReserve?.[1]?.[0], decimals))
      : Number(formatUnits(poolReserve?.[1]?.[1], decimals));
  const toReserve =
    poolReserve?.[0]?.[0] === TOKEN_ADDRESS[toToken]
      ? Number(formatUnits(poolReserve?.[1]?.[0], decimals))
      : Number(formatUnits(poolReserve?.[1]?.[1], decimals));

  const fromTokenBalance = balancesMap?.[fromToken]?.value ?? 0;
  const toTokenBalance = balancesMap?.[toToken]?.value ?? 0;

  const fromSchema = yup.object({
    [HOOK_FORM_KEY.NUMBER_INPUT_VALUE]: yup
      .number()
      .min(0)
      .max(fromTokenBalance, 'Exceeds wallet balance'),
  });

  const fee = 0.003;
  const toValue = fromValue
    ? toReserve - toReserve * (fromReserve / (fromReserve + Number(fromValue) * (1 - fee)))
    : undefined;

  const swapRatio = (toValue ?? 0) / Number(fromValue);

  const validToSwap =
    fromValue &&
    Number(fromValue) > 0 &&
    Number(fromValue) <= fromTokenBalance &&
    toValue &&
    toValue > 0;

  return {
    fromToken,
    fromValue,
    toToken,
    toValue,

    setFromToken,
    setFromValue,
    setToToken,
    resetFromValue,
    resetAll,

    fromTokenBalance,
    toTokenBalance,

    fromSchema,

    swapRatio,
    validToSwap,

    poolId,
  };
};
