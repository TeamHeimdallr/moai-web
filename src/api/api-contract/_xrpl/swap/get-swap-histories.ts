/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query';
import { AccountTxRequest, dropsToXrp, TransactionMetadata } from 'xrpl';

import { QUERY_KEYS } from '~/api/utils/query-keys';

import { TOKEN_PRICE } from '~/constants';

import { useXrpl } from '~/hooks/contexts';
import { useNetwork } from '~/hooks/contexts/use-network';
import { IPoolSwapHistories, IToken } from '~/types';

import { useTokenPrice } from '../token/price';

interface UseGetSwapHistories {
  id: string;
}
export const useGetSwapHistories = ({ id }: UseGetSwapHistories) => {
  const { isXrp } = useNetwork();
  const { client, isConnected } = useXrpl();

  const { price: moiPrice } = useTokenPrice();

  const request = {
    command: 'account_tx',
    account: id,
    ledger_index_min: -1,
    ledger_index_max: -1,
    limit: 100,
  } as AccountTxRequest;

  const getTxs = async () => {
    if (!isXrp) return;

    const info = await client.request(request);
    return info;
  };

  const getTxTokens = (amount: string | Record<string, string>, meta: TransactionMetadata) => {
    const defaultResult = [
      { symbol: 'XRP', balance: 0, price: 0, value: 0 },
      { symbol: 'MOI', balance: 0, price: 0, value: 0 },
    ] as IToken[];
    if (!amount || !isXrp) return defaultResult;

    const { TransactionResult, AffectedNodes } = meta;

    if (TransactionResult !== 'tesSUCCESS') return defaultResult;
    if (AffectedNodes.length === 0) return defaultResult;

    // xrp => moi
    if (typeof amount === 'object') {
      const affectedNode = AffectedNodes?.find(node => {
        const isAccountRoot = (node as any)?.ModifiedNode?.LedgerEntryType === 'AccountRoot';
        const isAMM = !!(node as any)?.ModifiedNode?.FinalFields.AMMID;

        return isAccountRoot && !isAMM;
      });

      const afterBalance = (affectedNode as any)?.ModifiedNode?.FinalFields?.Balance ?? 0;
      const beforeBalance = (affectedNode as any)?.ModifiedNode?.PreviousFields?.Balance ?? 0;

      const xrpBalance = Number(dropsToXrp(Math.abs(afterBalance - beforeBalance)));
      const xrpPrice = TOKEN_PRICE.XRP;
      const moiBalance = Number(amount.value);

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
    }

    // moi => xrp
    if (typeof amount === 'string') {
      const affectedNode = AffectedNodes?.find(
        node => (node as any)?.ModifiedNode?.LedgerEntryType === 'RippleState'
      )?.[0];

      const afterBalance = (affectedNode as any)?.ModifiedNode?.FinalFields?.Balance?.value ?? 0;
      const beforeBalance =
        (affectedNode as any)?.ModifiedNode?.PreviousFields?.Balance?.value ?? 0;

      const xrpBalance = Number(dropsToXrp(amount));
      const xrpPrice = TOKEN_PRICE.XRP;
      const moiBalance = Number(Math.abs(afterBalance - beforeBalance));

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
    }
  };

  const {
    data: txDataRaw,
    isLoading,
    isSuccess,
    isError,
  } = useQuery([...QUERY_KEYS.AMM.GET_TRANSACTIONS, id], getTxs, {
    staleTime: 3000,
    enabled: isConnected && isXrp,
  });

  const txData = (txDataRaw?.result?.transactions ?? []).filter(
    ({ tx }) => tx?.TransactionType === 'Payment'
  );
  if (txData.length === 0)
    return {
      data: [],
      isLoading,
      isSuccess,
      isError,
    };

  const provisions = txData?.map(({ tx, meta }) => {
    const trader = tx?.Account ?? '';
    const time = (tx?.date ?? 0) * 1000 + new Date('2000-01-01').getTime();
    const txHash = tx?.hash ?? '';
    const amount = (tx as any)?.Amount ?? '';

    if (typeof meta === 'string') {
      return {
        id,
        trader,
        tokens: [] as IToken[],
        time,
        txHash,
      } as IPoolSwapHistories;
    }

    const tokens = getTxTokens(amount, meta as TransactionMetadata);
    return {
      id,
      trader,
      tokens,
      time,
      txHash,
    } as IPoolSwapHistories;
  });

  return {
    data: provisions,
    isLoading,
    isSuccess,
    isError,
  };
};
