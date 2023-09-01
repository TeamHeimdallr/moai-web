import * as yup from 'yup';

import { TOKEN_USD_MAPPER } from '~/constants';
import { useBalancesAll } from '~/hooks/data/use-balance-all';
import { HOOK_FORM_KEY } from '~/types/components';

import { useSwapStore } from '../states/swap';

export const useSwap = () => {
  const { balancesMap } = useBalancesAll();

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

  const fromTokenBalance = balancesMap?.[fromToken]?.value ?? 0;
  const toTokenBalance = balancesMap?.[toToken]?.value ?? 0;

  const fromSchema = yup.object({
    [HOOK_FORM_KEY.NUMBER_INPUT_VALUE]: yup
      .number()
      .min(0)
      .max(fromTokenBalance, 'Exceeds wallet balance'),
  });

  const swapRatio =
    fromToken && toToken ? TOKEN_USD_MAPPER[fromToken] / TOKEN_USD_MAPPER[toToken] : 0;

  const toValue = fromValue ? Number((fromValue * swapRatio).toFixed(2)) : undefined;
  const validToSwap =
    fromValue && fromValue > 0 && fromValue <= fromTokenBalance && toValue && toValue > 0;

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
  };
};
