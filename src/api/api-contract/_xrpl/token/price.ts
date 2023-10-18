import { useQuery } from '@tanstack/react-query';
import { BaseRequest, dropsToXrp } from 'xrpl';

import { QUERY_KEYS } from '~/api/utils/query-keys';

import { TOKEN_PRICE, XRP_AMM } from '~/constants';

import { useXrpl } from '~/hooks/contexts';
import { useNetwork } from '~/hooks/contexts/use-network';
import { IAmm } from '~/types';

import { AmmResponse } from '~/moai-xrp-ledger/types/contracts';

// TODO: connect to server. get calculated token price in pool
export const useTokenPrice = () => {
  const { isXrp } = useNetwork();
  const { client, isConnected } = useXrpl();
  const amm = XRP_AMM?.[0] ?? ({} as IAmm);

  const request = {
    command: 'amm_info',
    asset: amm?.assets?.asset1,
    asset2: amm?.assets?.asset2,
    ledger_index: 'validated',
  } as BaseRequest;

  const getAmm = async () => {
    if (!isXrp) return;

    const info = await client.request<BaseRequest, AmmResponse>(request);
    return info;
  };

  const { data: ammInfoRawData } = useQuery(
    [...QUERY_KEYS.AMM.GET_AMM_INFO, amm?.assets.asset1.currency, amm?.assets.asset2.currency],
    getAmm,
    { staleTime: 1000 * 60 * 5, enabled: isConnected && !!amm && isXrp }
  );

  const ammInfoRaw = ammInfoRawData?.result?.amm;

  const xrpBalance = Number(dropsToXrp(ammInfoRaw?.amount ?? '0'));
  const moiBalance = Number(ammInfoRaw?.amount2?.value ?? '0');

  const price = moiBalance ? TOKEN_PRICE.XRP * (xrpBalance / moiBalance) : 0;

  const getTokenPrice = (name?: string) => {
    if (name?.toLowerCase() === 'xrp' || name?.toLowerCase() === 'wxrp') return price;

    return (TOKEN_PRICE?.[name || ''] as number) || 0;
  };

  return {
    price,
    getTokenPrice,
  };
};
