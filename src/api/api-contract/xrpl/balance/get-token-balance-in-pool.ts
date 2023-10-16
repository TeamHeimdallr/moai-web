import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import { AccountInfoRequest, GatewayBalancesRequest } from 'xrpl';

import { QUERY_KEYS } from '~/api/utils/query-keys';

import { TOKEN_PRICE, XRP_AMM, XRP_TOKEN_ISSUER } from '~/constants';

import { useXrpl } from '~/hooks/contexts';
import { useConnectedWallet } from '~/hooks/wallets';
import { IAmm, ITokenbalanceInPool } from '~/types';

import { useAmmInfo } from '../amm/get-amm-info';

// TODO: change to get all balances. using gateway balances promise all
export const useTokenBalanceInPool = (): ITokenbalanceInPool => {
  const { client, isConnected } = useXrpl();
  const { xrp: xrpWallet } = useConnectedWallet();
  const { address } = xrpWallet;

  const { moiPrice } = useAmmInfo(XRP_TOKEN_ISSUER.XRP_MOI);

  const xrpBalanceData = async () => {
    const res =
      (
        await client.request({
          command: 'account_info',
          account: address,
        } as AccountInfoRequest)
      )?.result?.account_data?.Balance || 0;

    return Number(formatUnits(BigInt(res), 6));
  };

  const moiBalanceData = async () => {
    const res =
      (
        await client.request({
          command: 'gateway_balances',
          account: address,
        } as GatewayBalancesRequest)
      )?.result?.assets?.[XRP_TOKEN_ISSUER.MOI]?.find(asset => asset?.currency === 'MOI')?.value ||
      0;

    return Number(res);
  };

  const { data: xrpData } = useQuery(
    [...QUERY_KEYS.TOKEN.GET_XRP_BALANCE, address],
    xrpBalanceData,
    {
      staleTime: 1000 * 60 * 5,
      enabled: !!address && !!client && isConnected,
    }
  );

  const { data: moiData } = useQuery(
    [...QUERY_KEYS.TOKEN.GET_MOI_BALANCE, address],
    moiBalanceData,
    {
      staleTime: 1000 * 60 * 5,
      enabled: !!address && !!client && isConnected,
    }
  );

  const success = xrpData !== undefined && moiData !== undefined;

  if (!success)
    return {
      balancesMap: undefined,
      balancesArray: undefined,
    };

  const xrp = {
    symbol: 'XRP',
    balance: xrpData ?? 0,
    value: (xrpData ?? 0) * TOKEN_PRICE.XRP,
  };

  const moi = {
    symbol: 'MOI',
    balance: moiData ?? 0,
    value: (moiData ?? 0) * moiPrice,
  };
  const balancesMap = {
    XRP: xrp,
    MOI: moi,
  };

  const balancesArray = [xrp, moi];

  return {
    balancesMap,
    balancesArray,
  };
};

export const useLiquidityTokenBalances = (id: string): number => {
  const amm = XRP_AMM.find(amm => amm.id === id) as IAmm;
  const { client, isConnected } = useXrpl();
  const { xrp } = useConnectedWallet();
  const { address } = xrp;

  const getLiquidityTokenBalanceData = async () => {
    const res =
      (
        await client.request({
          command: 'gateway_balances',
          account: id,
          hotwallet: [address],
        } as GatewayBalancesRequest)
      )?.result?.balances?.[address]?.find(asset => asset?.currency === amm.lpTokenCurrency)
        ?.value || 0;

    return Number(res);
  };

  const { data: liquidityTokenBalanceData } = useQuery(
    [...QUERY_KEYS.TOKEN.GET_LIQUIDITY_TOKEN_BALANCE, address],
    getLiquidityTokenBalanceData,
    {
      staleTime: 1000 * 60 * 5,
      enabled: !!address && !!client && isConnected,
    }
  );

  return liquidityTokenBalanceData || 0;
};
