import * as yup from 'yup';

import { TOKEN_USD_MAPPER } from '~/constants';
import { useTokenBalances } from '~/hooks/data/use-token-balances';
import { HOOK_FORM_KEY } from '~/types/components';

import { useSwapStore } from '../states/swap';

export const useSwap = () => {
  const { tokenBalances } = useTokenBalances();

  const {
    fromToken,
    fromValue,
    toToken,

    setFromToken,
    setFromValue,
    setToToken,
  } = useSwapStore();

  const fromTokenBalance = tokenBalances.find(t => t.symbol === fromToken)?.balance ?? 0;
  const toTokenBalance = tokenBalances.find(t => t.symbol === toToken)?.balance ?? 0;

  const fromSchema = yup.object({
    [HOOK_FORM_KEY.NUMBER_INPUT_VALUE]: yup
      .number()
      .min(0)
      .max(fromTokenBalance, 'Exceeds wallet balance'),
  });

  const swapRatio =
    fromToken && toToken ? TOKEN_USD_MAPPER[fromToken] / TOKEN_USD_MAPPER[toToken] : 0;

  const toValue = Number(((fromValue ?? 0) * swapRatio).toFixed(2));
  const validToSwap = fromValue && fromValue > 0 && fromValue <= fromTokenBalance && toValue > 0;

  return {
    fromToken,
    fromValue,
    toToken,
    toValue,

    setFromToken,
    setFromValue,
    setToToken,

    fromTokenBalance,
    toTokenBalance,

    fromSchema,

    swapRatio,
    validToSwap,
  };
};
