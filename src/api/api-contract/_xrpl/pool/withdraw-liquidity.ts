import { useMutation } from '@tanstack/react-query';
import { parseUnits, toHex } from 'viem';
import { AMMWithdraw } from 'xrpl';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getTokenDecimal, xrplForceDecimal } from '~/utils';
import { ITokenComposition, NETWORK } from '~/types';

import { useAccountInfo } from '../account/account-info';

interface Props {
  token1: ITokenComposition & { amount: number };
  token2: ITokenComposition & { amount: number };
  enabled?: boolean;
}
export const useWithdrawLiquidity = ({ token1, token2, enabled }: Props) => {
  const { isXrp } = useNetwork();

  const { xrp } = useConnectedWallet();
  const { address, connectedConnector } = xrp;

  const tokens = [token1, token2];

  const getTxRequestAssets = () => {
    const xrp = tokens.find(t => t.currency === 'XRP');

    if (xrp) {
      const asset1 = { currency: 'XRP' };
      const amount1 = parseUnits(
        xrplForceDecimal(xrp?.amount || 0).toString(),
        getTokenDecimal(NETWORK.XRPL, 'XRP')
      ).toString();

      const remain = tokens.filter(t => t.currency !== 'XRP')?.[0];
      const asset2 = {
        issuer: remain.address || '',
        currency: remain.currency,
      };
      const amount2 = {
        ...asset2,
        value: xrplForceDecimal(remain?.amount || 0).toString(),
      };

      return {
        Amount: amount1,
        Amount2: amount2,
        Asset: asset1,
        Asset2: asset2,
      };
    }

    const asset1 = { issuer: token1?.address || '', currency: token1?.currency || '' };
    const amount1 = { ...asset1, value: xrplForceDecimal(token1?.amount || 0).toString() };
    const asset2 = { issuer: token2?.address || '', currency: token2?.currency || '' };
    const amount2 = { ...asset2, value: xrplForceDecimal(token1?.amount || 0).toString() };

    return {
      Amount: amount1,
      Amount2: amount2,
      Asset: asset1,
      Asset2: asset2,
    };
  };

  const { accountInfo } = useAccountInfo({ account: address, enabled: isXrp && !!address });
  const sequence = accountInfo?.account_data.Sequence;

  const txAssets = getTxRequestAssets();
  const txRequest = {
    TransactionType: 'AMMWithdraw',
    Account: address,
    ...txAssets,
    Fee: '100',
    SourceTag: 60006000,
    Flags: connectedConnector === 'dcent' ? toHex(1048576 + 2147483648) : 1048576,
    Sequence: connectedConnector === 'dcent' ? sequence : undefined,
  } as AMMWithdraw;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitTx = async () => await xrp.submitTransaction(txRequest as any);

  const { data, isLoading, isSuccess, isError, mutateAsync } = useMutation(
    ['XRPL', 'WITHDRAW_LP'],
    submitTx
  );

  const blockTimestamp = data?.date
    ? (data?.date || 0) * 1000 + new Date('2000-01-01').getTime()
    : new Date().getTime();

  const writeAsync = async () => {
    if (!address || !isXrp || !enabled) return;
    await mutateAsync();
  };

  const error = data?.meta?.TransactionResult !== 'tesSUCCESS';

  return {
    isLoading,
    isSuccess,
    isError: isError || error,

    txData: data,
    blockTimestamp,

    writeAsync,
    estimateFee: () => 0.00005,
  };
};
