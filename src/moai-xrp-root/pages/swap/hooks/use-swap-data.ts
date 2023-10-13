import { formatUnits } from 'viem';
import * as yup from 'yup';

import { useConnectEvmWallet } from '~/hooks/wallets/use-connect-evm-wallet';
import { formatFloat } from '~/utils/util-number';
import { HOOK_FORM_KEY } from '~/types/components/inputs';

import { usePoolTokens } from '~/moai-xrp-root/api/api-contract/pool/get-liquidity-pool-balance';

import { POOL_ID, TOKEN_ADDRESS, TOKEN_DECIAML } from '~/moai-xrp-root/constants';

import { useBalancesAll } from '~/moai-xrp-root/hooks/data/use-balance-all';
import { useGetRootNetworkTokenPrice } from '~/moai-xrp-root/hooks/data/use-root-network-token-price';

import { useSwapStore } from '../states/swap';

export const useSwapData = () => {
  const { address } = useConnectEvmWallet();

  const { balancesMap } = useBalancesAll();
  const enabled = !!address;

  // TODO:
  const poolId = POOL_ID.ROOT_XRP;

  const { data: poolBalances } = usePoolTokens(poolId, { enabled });
  const { getTokenPrice } = useGetRootNetworkTokenPrice();

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
      ? Number(formatUnits(poolBalances?.[1]?.[0] ?? 0n, TOKEN_DECIAML))
      : Number(formatUnits(poolBalances?.[1]?.[1] ?? 0n, TOKEN_DECIAML));
  const toReserve =
    (poolBalances?.[0]?.[0] ?? '0x0') === TOKEN_ADDRESS[toToken]
      ? Number(formatUnits(poolBalances?.[1]?.[0] ?? 0n, TOKEN_DECIAML))
      : Number(formatUnits(poolBalances?.[1]?.[1] ?? 0n, TOKEN_DECIAML));

  const fromTokenBalance = balancesMap?.[fromToken]?.balance ?? 0;
  const toTokenBalance = balancesMap?.[toToken]?.balance ?? 0;

  const fromTokenPrice = getTokenPrice(fromToken);
  const toTokenPrice = getTokenPrice(toToken);

  const fromSchema = yup.object({
    [HOOK_FORM_KEY.NUMBER_INPUT_VALUE]: yup
      .number()
      .min(0)
      .max(fromTokenBalance, 'Exceeds wallet balance'),
  });

  const fee = 0.003;
  const toValue = fromValue
    ? Number(
        formatFloat(
          toReserve - toReserve * (fromReserve / (fromReserve + Number(fromValue) * (1 - fee))),
          8
        )
      )
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
    fromTokenPrice,
    toTokenBalance,
    toTokenPrice,

    fromSchema,

    swapRatio,
    validToSwap,

    poolId,
  };
};
