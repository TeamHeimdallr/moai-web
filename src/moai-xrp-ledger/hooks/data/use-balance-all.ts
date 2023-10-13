import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import { AccountInfoRequest, GatewayBalancesRequest } from 'xrpl';

import { useConnectXrplWallet } from '~/hooks/wallets/use-connect-xrp-wallet';
import { useXrplStore } from '~/states/data/xrpl';

import { useAmmInfo } from '~/moai-xrp-ledger/api/api-contract/amm/get-amm-info';

import { ISSUER, LIQUIDITY_TOKEN_CURRENCY, TOKEN_USD_MAPPER } from '~/moai-xrp-ledger/constants';

import { QUERY_KEYS } from '~/moai-xrp-ledger/api/utils/query-keys';
import { TOKEN, TokenBalanceInfoAll } from '~/moai-xrp-ledger/types/contracts';

export const useBalancesAll = (address?: string): TokenBalanceInfoAll => {
  const { client, isConnected } = useXrplStore();
  const { address: currentAddress } = useConnectXrplWallet();

  // TODO:
  const account = ISSUER.XRP_MOI;
  const { moiPrice } = useAmmInfo(account);

  const target = address ?? currentAddress;

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
    {
      staleTime: 1000 * 60 * 5,
      enabled: !!target && !!client && isConnected,
    }
  );

  const { data: moiData } = useQuery(
    [...QUERY_KEYS.TOKEN.GET_MOI_BALANCE, target],
    moiBalanceData,
    {
      staleTime: 1000 * 60 * 5,
      enabled: !!target && !!client && isConnected,
    }
  );

  const success = xrpData !== undefined && moiData !== undefined;

  if (!success)
    return {
      balancesMap: undefined,
      balancesArray: undefined,
    };

  const xrp = {
    balance: xrpData ?? 0,
    value: (xrpData ?? 0) * TOKEN_USD_MAPPER.XRP,
    name: 'XRP',
  };

  const moi = {
    balance: moiData ?? 0,
    value: (moiData ?? 0) * moiPrice,
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

export const useLiquidityTokenBalances = (address?: string): number => {
  const { client, isConnected } = useXrplStore();
  const { address: currentAddress } = useConnectXrplWallet();

  const target = address ?? currentAddress;

  const getLiquidityTokenBalanceData = async () => {
    const res =
      (
        await client.request({
          command: 'gateway_balances',
          account: 'rHxWxmYU1AkWFmp3eq2afQ4qrPE7sVqHVr', // TODO:
          hotwallet: [target], // TODO:
        } as GatewayBalancesRequest)
      )?.result?.balances?.[target]?.find(asset => asset?.currency === LIQUIDITY_TOKEN_CURRENCY)
        ?.value || 0;

    return Number(res);
  };

  const { data: liquidityTokenBalanceData } = useQuery(
    [...QUERY_KEYS.TOKEN.GET_LIQUIDITY_TOKEN_BALANCE, target],
    getLiquidityTokenBalanceData,
    {
      staleTime: 1000 * 60 * 5,
      enabled: !!target && !!client && isConnected,
    }
  );

  return liquidityTokenBalanceData || 0;
};
