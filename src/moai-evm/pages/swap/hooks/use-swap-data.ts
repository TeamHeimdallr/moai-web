import { formatUnits } from 'viem';
import * as yup from 'yup';

import { usePoolTokens } from '~/moai-evm/api/api-contract/pool/get-liquidity-pool-balance';

import { CHAIN, POOL_ID, TOKEN_ADDRESS } from '~/moai-evm/constants';

import { useBalancesAll } from '~/moai-evm/hooks/data/use-balance-all';

import { useSwapStore } from '../states/swap';

export const useSwapData = () => {
  const isRoot = CHAIN === 'root';
  const decimals = isRoot ? 6 : 18;

  const { balancesMap } = useBalancesAll();

  const poolId = CHAIN === 'root' ? POOL_ID.ROOT_XRP : POOL_ID.POOL_A;

  const { data: poolBalances } = usePoolTokens(poolId);

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
    (poolBalances?.[0]?.[0] ?? '0x0') === TOKEN_ADDRESS[fromToken]
      ? Number(formatUnits(poolBalances?.[1]?.[0] ?? 0n, decimals))
      : Number(formatUnits(poolBalances?.[1]?.[1] ?? 0n, decimals));
  const toReserve =
    (poolBalances?.[0]?.[0] ?? '0x0') === TOKEN_ADDRESS[toToken]
      ? Number(formatUnits(poolBalances?.[1]?.[0] ?? 0n, decimals))
      : Number(formatUnits(poolBalances?.[1]?.[1] ?? 0n, decimals));

  const fromTokenBalance = balancesMap?.[fromToken]?.value ?? 0;
  const toTokenBalance = balancesMap?.[toToken]?.value ?? 0;

  const fromSchema = yup.object({
    ['NUMBER_INPUT_VALUE']: yup.number().min(0).max(fromTokenBalance, 'Exceeds wallet balance'),
  });

  const fee = 0.003;
  const toValue = fromValue
    ? toReserve - toReserve * (fromReserve / (fromReserve + Number(fromValue) * (1 - fee)))
    : undefined;

  const swapRatio =
    fromValue == 0 || toValue == 0
      ? toReserve - toReserve * (fromReserve / (fromReserve + (1 - fee)))
      : (toValue ?? 0) / Number(fromValue == 0 ? 0.0001 : fromValue);

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
