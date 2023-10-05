import * as yup from 'yup';

import { HOOK_FORM_KEY } from '~/types/components/inputs';

import { useAmmInfo } from '~/moai-xrp-ledger/api/api-contract/amm/get-amm-info';

import { ISSUER, TOKEN_USD_MAPPER } from '~/moai-xrp-ledger/constants';

import { useBalancesAll } from '~/moai-xrp-ledger/hooks/data/use-balance-all';

import { useSwapStore } from '../states/swap';

export const useSwapData = () => {
  const { balancesMap } = useBalancesAll();

  // TODO: support pool with multiple tokens
  const account = ISSUER.XRP_MOI;
  const { ammInfo, moiPrice } = useAmmInfo(account);
  const { token1, token2 } = ammInfo;

  const {
    fromToken,
    fromValue,
    toToken,
    toValue,

    setFromToken,
    setFromValue,
    setToToken,
    setToValue,

    resetFromValue,
    resetAll,
  } = useSwapStore();

  const fromReserve = fromToken === token1.currency ? token1.value : token2.value;
  const toReserve = toToken === token1.currency ? token1.value : token2.value;

  const fromTokenBalance = balancesMap?.[fromToken]?.balance ?? 0;
  const toTokenBalance = balancesMap?.[toToken]?.balance ?? 0;

  const fromTokenPrice = fromToken === 'MOI' ? moiPrice : TOKEN_USD_MAPPER[fromToken];
  const toTokenPrice = toToken === 'MOI' ? moiPrice : TOKEN_USD_MAPPER[toToken];

  const fromSchema = yup.object({
    [HOOK_FORM_KEY.NUMBER_INPUT_VALUE]: yup
      .number()
      .min(0)
      .max(fromTokenBalance, 'Exceeds wallet balance'),
  });

  const toSchema = yup.object({
    [HOOK_FORM_KEY.NUMBER_INPUT_VALUE]: yup.number().min(0),
  });

  const fee = 0.005; // TODO

  const swapRatio =
    fromValue == 0 || toValue == 0
      ? toReserve - toReserve * (fromReserve / (fromReserve + (1 - fee)))
      : Number(toValue ?? 0) / Number(fromValue == 0 ? 0.0001 : fromValue);

  const validToSwap =
    fromValue &&
    Number(fromValue) > 0 &&
    Number(fromValue) <= fromTokenBalance &&
    toValue &&
    Number(toValue ?? 0) > 0;

  return {
    fromToken,
    fromValue,

    toToken,
    toValue,

    setFromToken,
    setFromValue,
    setToToken,
    setToValue,

    resetFromValue,
    resetAll,

    fromTokenBalance,
    fromTokenPrice,
    toTokenBalance,
    toTokenPrice,

    fromSchema,
    toSchema,

    swapRatio,
    validToSwap,

    account,
  };
};
