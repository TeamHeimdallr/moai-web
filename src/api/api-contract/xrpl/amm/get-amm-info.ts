import { useQuery } from '@tanstack/react-query';
import { BaseRequest, dropsToXrp, ServerStateRequest } from 'xrpl';

import { QUERY_KEYS } from '~/api/utils/query-keys';

import { TOKEN_PRICE, XRP_AMM } from '~/constants';

import { useXrpl } from '~/hooks/contexts';

import { AmmResponse, FormattedAmmResponse } from '~/moai-xrp-ledger/types/contracts';

// TODO: change to server api
export const useAmmInfo = (id: string) => {
  const { client, isConnected } = useXrpl();
  const amm = XRP_AMM.find(amm => amm.id === id);

  const request = {
    command: 'amm_info',
    asset: amm?.assets.asset1,
    asset2: amm?.assets.asset2,
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
    const fee = dropsToXrp(Number(ammFeeDrops));

    return fee;
  };

  const { data: ammInfoRawData } = useQuery(
    [...QUERY_KEYS.AMM.GET_AMM_INFO, amm?.assets.asset1.currency, amm?.assets.asset2.currency],
    getAmm,
    { staleTime: 1000 * 60 * 5, enabled: isConnected && !!amm }
  );
  const { data: feeData } = useQuery(
    [...QUERY_KEYS.AMM.GET_FEE, amm?.assets.asset1.currency, amm?.assets.asset2.currency],
    getFee,
    { staleTime: 1000 * 60 * 5, enabled: isConnected && !!amm }
  );

  const fee = Number(feeData ?? '0');

  const ammInfoRaw = ammInfoRawData?.result?.amm;
  const ammExist = !!ammInfoRaw ?? false;

  const xrpBalance = Number(dropsToXrp(ammInfoRaw?.amount ?? '0'));
  const moiBalance = Number(ammInfoRaw?.amount2.value ?? '0');

  const moiPrice = moiBalance ? TOKEN_PRICE.XRP * (xrpBalance / moiBalance) : 0;

  const xrpValue = xrpBalance * TOKEN_PRICE.XRP;
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
      price: TOKEN_PRICE.XRP ?? 0,
      value: xrpValue,
      weight: 50, // TODO:
    },

    token2: {
      currency: ammInfoRaw?.amount2.currency ?? 'MOI',
      issuer: ammInfoRaw?.amount2.issuer ?? '',
      balance: moiBalance,
      price: moiPrice ?? 0,
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
