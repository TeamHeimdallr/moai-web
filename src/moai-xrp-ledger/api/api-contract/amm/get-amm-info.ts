import { useQuery } from '@tanstack/react-query';
import { BaseRequest, dropsToXrp, ServerStateRequest } from 'xrpl';

import { AMM, TOKEN_USD_MAPPER } from '~/moai-xrp-ledger/constants';

import { QUERY_KEYS } from '~/moai-xrp-ledger/api/utils/query-keys';
import { useXrplStore } from '~/moai-xrp-ledger/states/data/xrpl';
import { Amm, AmmResponse, FormattedAmmResponse } from '~/moai-xrp-ledger/types/contracts';

export const useAmmInfo = (amm: Amm = AMM.XRP_MOI) => {
  const { client } = useXrplStore();

  const request = {
    command: 'amm_info',
    asset: amm.asset1,
    asset2: amm.asset2,
    ledger_index: 'validated',
  } as BaseRequest;

  const getAmm = async () => {
    const info = await client.request<BaseRequest, AmmResponse>(request);
    return info;
  };

  const getFee = async () => {
    const serverState = await client.request({ command: 'server_state' } as ServerStateRequest);

    const ammFeeDrops =
      serverState?.result?.state?.validated_ledger?.reserve_inc?.toString() ?? '0';
    const fee = dropsToXrp(Number(ammFeeDrops) * 1e6);

    return fee;
  };

  const { data: _ammInfoRaw } = useQuery(
    [...QUERY_KEYS.AMM.GET_AMM_INFO, amm.asset1.currency, amm.asset2.currency],
    getAmm,
    { staleTime: 1000 * 60 * 5 }
  );
  const { data: feeData } = useQuery(
    [...QUERY_KEYS.AMM.GET_FEE, amm.asset1.currency, amm.asset2.currency],
    getFee,
    { staleTime: 1000 * 60 * 5 }
  );

  const fee = Number(feeData ?? '0');

  const ammInfoRaw = _ammInfoRaw?.result?.amm;
  const ammExist = !!ammInfoRaw ?? false;

  const xrpBalance = Number(ammInfoRaw?.amount ?? '0');
  const moiBalance = Number(ammInfoRaw?.amount2.value ?? '0');

  const moiPrice = moiBalance ? TOKEN_USD_MAPPER.XRP * (xrpBalance / moiBalance) : 0;

  const xrpValue = xrpBalance * TOKEN_USD_MAPPER.XRP;
  const moiValue = moiBalance * moiPrice;

  const poolTotalValue = xrpValue + moiValue;

  const liquidityPoolTokenBalance = Number(ammInfoRaw?.lp_token.value ?? '0');
  const liquidityPoolTokenPrice = liquidityPoolTokenBalance
    ? poolTotalValue / liquidityPoolTokenBalance
    : 0;

  const ammInfo: FormattedAmmResponse = {
    account: ammInfoRaw?.account ?? '',
    poolTotalValue,
    fee,

    token1: {
      currency: 'XRP',
      balance: xrpBalance,
      price: TOKEN_USD_MAPPER.XRP ?? 0,
      value: xrpValue,
      weight: 50, // TODO:
    },

    token2: {
      currency: ammInfoRaw?.amount2.currency ?? 'MOI',
      issuer: ammInfoRaw?.amount2.issuer ?? '',
      balance: moiBalance,
      price: TOKEN_USD_MAPPER.XRP ?? 0,
      value: moiValue,
      weight: 50, // TODO:
    },

    liquidityPoolToken: {
      currency: `50XRP-50${ammInfoRaw?.amount2.currency ?? 'MOI'}`,
      issuer: ammInfoRaw?.lp_token.issuer ?? '',
      balance: liquidityPoolTokenBalance,
      price: liquidityPoolTokenPrice,
      value: poolTotalValue,
    },
  };

  return {
    ammExist,
    ammInfoRaw,
    ammInfo,

    moiPrice,
  };
};
