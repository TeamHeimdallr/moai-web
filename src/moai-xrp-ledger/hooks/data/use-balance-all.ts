import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import { AccountInfoRequest, GatewayBalancesRequest } from 'xrpl';

import { ISSUER } from '~/moai-xrp-ledger/constants';

import { QUERY_KEYS } from '~/moai-xrp-ledger/api/utils/query-keys';
import { useXrplStore } from '~/moai-xrp-ledger/states/data/xrpl';
import { TOKEN, TokenBalanceInfoAll } from '~/moai-xrp-ledger/types/contracts';

import { useConnectXrplWallet } from './use-connect-xrpl-wallet';

export const useBalancesAll = (address?: string): TokenBalanceInfoAll => {
  const { client } = useXrplStore();
  const { address: currentAddress } = useConnectXrplWallet();

  const target = address ?? currentAddress ?? ISSUER.XRP_MOI;

  const xrpBalanceData = async () => {
    const res =
      (
        await client.request({
          command: 'account_info',
          account: target,
        } as AccountInfoRequest)
      )?.result?.account_data?.Balance || 0;

    return Number(formatUnits(BigInt(res), 6));
  };

  const moiBalanceData = async () => {
    const res =
      (
        await client.request({
          command: 'gateway_balances',
          account: target,
        } as GatewayBalancesRequest)
      )?.result?.assets?.[ISSUER.MOI]?.find(asset => asset?.currency === 'MOI')?.value || 0;

    return Number(res);
  };

  const { data: xrpData } = useQuery(
    [...QUERY_KEYS.TOKEN.GET_XRP_BALANCE, target],
    xrpBalanceData,
    { enabled: !!target && !!client }
  );

  const { data: moiData } = useQuery(
    [...QUERY_KEYS.TOKEN.GET_MOI_BALANCE, target],
    moiBalanceData,
    { enabled: !!target && !!client }
  );

  const success = xrpData && moiData;

  if (!success)
    return {
      balancesMap: undefined,
      balancesArray: undefined,
    };

  const xrp = {
    balance: xrpData ?? 0,
    name: 'XRP',
  };

  const moi = {
    balance: moiData ?? 0,
    name: 'MOI',
  };
  const balancesMap = {
    [TOKEN.XRP]: xrp,
    [TOKEN.MOI]: moi,
  };

  const balancesArray = [xrp, moi];

  return {
    balancesMap,
    balancesArray,
  };
};
