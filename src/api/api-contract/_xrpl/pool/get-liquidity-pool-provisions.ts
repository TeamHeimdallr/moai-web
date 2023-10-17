import { useQuery } from '@tanstack/react-query';
import { AccountTxRequest, dropsToXrp } from 'xrpl';

import { QUERY_KEYS } from '~/api/utils/query-keys';

import { TOKEN_PRICE } from '~/constants';

import { useXrpl } from '~/hooks/contexts';
import { useNetwork } from '~/hooks/contexts/use-network';
import { IPoolLiquidityProvisions, IToken } from '~/types';

import { useTokenPrice } from '../token/price';

export const useGetLiquidityPoolProvisions = (account: string) => {
  const { isXrp } = useNetwork();
  const { client, isConnected } = useXrpl();

  const { price: moiPrice } = useTokenPrice();

  const request = {
    command: 'account_tx',
    account,
    ledger_index_min: -1,
    ledger_index_max: -1,
    limit: 100,
  } as AccountTxRequest;

  const getTxs = async () => {
    const info = await client.request(request);
    return info;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getTxTokens = (tx: any) => {
    const defaultResult = [
      { symbol: 'XRP', balance: 0, price: 0, value: 0 },
      { symbol: 'MOI', balance: 0, price: 0, value: 0 },
    ] as IToken[];
    if (!tx || !isXrp) return defaultResult;

    let xrpBalance: number = 0;
    let xrpPrice: number = 0;
    let moiBalance: number = 0;

    if (tx?.Asset?.currency === 'XRP') {
      xrpBalance = Number(dropsToXrp(tx.Amount));
      xrpPrice = TOKEN_PRICE.XRP;
      moiBalance = Number(tx?.Amount2?.value ?? 0);
    }
    if (tx?.Asset?.currency === 'MOI') {
      xrpBalance = Number(dropsToXrp(tx.Amount2));
      xrpPrice = TOKEN_PRICE.XRP;
      moiBalance = Number(tx?.Amount?.value ?? 0);
    }

    const token1 = {
      symbol: 'XRP',
      balance: xrpBalance,
      price: xrpPrice,
      value: xrpBalance * xrpPrice,
    } as IToken;

    const token2 = {
      symbol: 'MOI',
      balance: moiBalance,
      price: moiPrice,
      value: moiBalance * moiPrice,
    } as IToken;

    return [token1, token2];
  };

  const {
    data: txDataRaw,
    isLoading,
    isSuccess,
    isError,
  } = useQuery([...QUERY_KEYS.AMM.GET_TRANSACTIONS, account], getTxs, {
    staleTime: 3000,
    enabled: isConnected && isXrp,
  });

  const txData = (txDataRaw?.result?.transactions ?? []).filter(
    ({ tx }) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (tx?.TransactionType as any) === 'AMMDeposit' ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (tx?.TransactionType as any) === 'AMMWithdraw'
  );

  const provisions = txData?.map(({ tx }) => {
    const type =
      (tx?.TransactionType as 'AMMDeposit' | 'AMMWithdraw') === 'AMMDeposit'
        ? 'deposit'
        : 'withdraw';

    const liquidityProvider = tx?.Account ?? '';
    const time = (tx?.date ?? 0) * 1000 + new Date('2000-01-01').getTime();
    const txHash = tx?.hash ?? '';

    const tokens = getTxTokens(tx);

    return {
      type,
      id: account,
      tokens,
      liquidityProvider,
      time,
      txHash,
    };
  });

  return {
    data: provisions as IPoolLiquidityProvisions[],
    isLoading,
    isSuccess,
    isError,
  };
};
