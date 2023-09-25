import { useEffect, useState } from 'react';
import { formatUnits } from 'viem';
import { AccountInfoRequest, Client, GatewayBalancesRequest } from 'xrpl';

import { ISSUER } from '~/moai-xrp-ledger/constants';
import { TOKEN_USD_MAPPER } from '~/moai-xrp-root/constants';

import { useXrplStore } from '~/moai-xrp-ledger/states/data/xrpl';

export const getXrplNetworkTokenPrice = async (client?: Client, name?: string) => {
  if (!client || !name) {
    return 0;
  }

  const xrpBalanceData =
    (
      await client.request({
        command: 'account_info',
        account: ISSUER.XRP_MOI,
      } as AccountInfoRequest)
    )?.result?.account_data?.Balance || 0;
  const xrpBalnace = Number(formatUnits(BigInt(xrpBalanceData), 6));

  const moaiBalanceData =
    (
      await client.request({
        command: 'gateway_balances',
        account: ISSUER.XRP_MOI,
      } as GatewayBalancesRequest)
    )?.result?.assets?.[ISSUER.MOI]?.find(asset => asset?.currency === 'MOI')?.value || 0;
  const moaiBalance = Number(moaiBalanceData);

  const xrpPrice = moaiBalance ? TOKEN_USD_MAPPER.XRP * (xrpBalnace / moaiBalance) : 0;

  if (name.toLowerCase() === 'xrp') return xrpPrice;
  return TOKEN_USD_MAPPER[name ?? ''] ?? 0;
};

export const useGetXrplNetworkTokenPrice = () => {
  const { client } = useXrplStore();

  const [xrpPrice, setXrpPrice] = useState(0);

  const getTokenPrice = (name?: string) => {
    if (name?.toLowerCase() === 'xrp') return xrpPrice;
    return TOKEN_USD_MAPPER[name ?? ''] ?? 0;
  };

  useEffect(() => {
    const fetch = async () => {
      const price = await getXrplNetworkTokenPrice(client, 'XRP');
      setXrpPrice(price);
    };

    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    xrpPrice,
    getTokenPrice,
  };
};
