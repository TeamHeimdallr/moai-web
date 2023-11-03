import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import { AccountInfoRequest, GatewayBalancesRequest } from 'xrpl';

import { QUERY_KEYS } from '~/api/utils/query-keys';

import { TOKEN_PRICE, XRP_AMM, XRP_TOKEN_ISSUER } from '~/constants';

import { useXrpl } from '~/hooks/contexts';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { IAmm, ITokenbalanceInPool } from '~/types';

import { useLiquidityPoolBalance } from '../pool/get-liquidity-pool-balance';

// TODO: implement new hook for swap
export const useTokenBalanceInPool = (): ITokenbalanceInPool => {
  const { isXrp } = useNetwork();
  const { client, isConnected } = useXrpl();
  const { xrp: xrpWallet } = useConnectedWallet();
  const { address } = xrpWallet;

  const { id } = useParams();

  // TODO: only for swap
  const { pool } = useLiquidityPoolBalance({ id: id ?? XRP_AMM[0].id });
  const { compositions } = pool;

  const xrpBalanceData = async () => {
    if (!isXrp) return 0;

    const res =
      (
        await client.request({
          command: 'account_info',
          account: address,
        } as AccountInfoRequest)
      )?.result?.account_data?.Balance || 0;

    return Number(formatUnits(BigInt(res), 6));
  };

  const { data: xrpData } = useQuery(
    [...QUERY_KEYS.TOKEN.GET_XRP_BALANCE, address],
    xrpBalanceData,
    {
      enabled: !!address && !!client && isConnected && isXrp,
    }
  );

  const xrp = {
    symbol: 'XRP',
    balance: xrpData ?? 0,
    value: (xrpData ?? 0) * TOKEN_PRICE.XRP,
  };

  const getTokenBalanceData = async () => {
    if (!isXrp) return;

    return await Promise.all(
      compositions
        .filter(token => token.symbol !== 'XRP')
        .map(async token => {
          const res = (
            await client.request({
              command: 'gateway_balances',
              account: address,
            } as GatewayBalancesRequest)
          )?.result?.assets?.[XRP_TOKEN_ISSUER[token.symbol]]?.find(
            asset => asset?.currency === token.symbol
          );

          return { symbol: res?.currency ?? '', balance: Number(res?.value) ?? 0 };
        })
    );
  };

  const { data: xrplTokensData } = useQuery(
    [...QUERY_KEYS.TOKEN.GET_XRPL_BALANCE, address],
    getTokenBalanceData,
    {
      enabled: !!address && !!client && isConnected && isXrp,
    }
  );

  const success =
    xrpData !== undefined && xrplTokensData !== undefined && xrplTokensData.length !== 0;

  if (!success || !isXrp)
    return {
      balancesMap: undefined,
      balancesArray: undefined,
    };

  const xrplTokensDataWithXRP =
    compositions.filter(token => token.symbol === 'XRP').length > 0
      ? [xrp, ...xrplTokensData]
      : xrplTokensData;

  const balancesMap = {};
  compositions.forEach(token => {
    const balance = xrplTokensDataWithXRP.find(t => t.symbol === token.symbol)?.balance ?? 0;

    balancesMap[token.symbol] = {
      symbol: token.symbol,
      balance,
      value: (balance ?? 0) * (token.price ?? 0),
    };
  });

  const balancesArray = compositions.map(token => {
    const balance = xrplTokensDataWithXRP.find(t => t.symbol === token.symbol)?.balance ?? 0;

    return {
      symbol: token.symbol,
      balance,
      value: (balance ?? 0) * (token.price ?? 0),
    };
  });

  return {
    balancesMap,
    balancesArray,
  };
};

export const useLiquidityTokenBalances = (id: string): number => {
  const { isXrp } = useNetwork();

  const amm = XRP_AMM.find(amm => amm.id === id) as IAmm;
  const { client, isConnected } = useXrpl();
  const { xrp } = useConnectedWallet();
  const { address } = xrp;

  const getLiquidityTokenBalanceData = async () => {
    if (!isXrp) return 0;

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
      enabled: !!address && !!client && isConnected && isXrp,
    }
  );

  return liquidityTokenBalanceData || 0;
};
