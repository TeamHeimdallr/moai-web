import { useMutation } from '@tanstack/react-query';
import { parseUnits } from 'viem';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getTokenDecimal } from '~/utils';
import { ITokenComposition, NETWORK } from '~/types';

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
      const amount1 = Number(
        Number(
          parseUnits((xrp.amount || 0).toFixed(6), getTokenDecimal(NETWORK.XRPL, 'XRP')).toString()
        ).toFixed(6)
      ).toString(); // max decimal is 6

      const remain = tokens.filter(t => t.currency !== 'XRP')?.[0];
      const asset2 = {
        issuer: remain.address || '',
        currency: remain.currency,
      };
      const amount2 = {
        ...asset2,
        value: Number(Number(remain.amount || 0).toFixed(6)).toString(),
      };

      return {
        Amount: amount1,
        Amount2: amount2,
        Asset: asset1,
        Asset2: asset2,
      };
    }

    const asset1 = { issuer: token1?.address || '', currency: token1?.currency || '' };
    const amount1 = { ...asset1, value: Number(Number(token1?.amount || 0).toFixed(6)).toString() };
    const asset2 = { issuer: token2?.address || '', currency: token2?.currency || '' };
    const amount2 = { ...asset2, value: Number(Number(token2?.amount || 0).toFixed(6)).toString() };

    return {
      Amount: amount1,
      Amount2: amount2,
      Asset: asset1,
      Asset2: asset2,
    };
  };

  const txAssets = getTxRequestAssets();
  const txRequest = {
    TransactionType: 'AMMWithdraw',
    Account: address,
    ...txAssets,
    Fee: '100',
    Flags: 1048576, // tfTwoAsset
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitTx = async () => await xrp.submitTransaction(txRequest as any);

  const { data, isLoading, isSuccess, mutateAsync } = useMutation(
    ['XRPL', 'WITHDRAW_LP'],
    submitTx
  );

  const txData = connectedConnector === 'gem' ? data?.result : data?.response?.data?.resp?.result;

  const blockTimestamp = txData?.date
    ? (txData?.date || 0) * 1000 + new Date('2000-01-01').getTime()
    : new Date().getTime();

  const writeAsync = async () => {
    if (!address || !isXrp || !enabled) return;
    await mutateAsync();
  };

  return {
    isLoading,
    isSuccess,

    txData,
    blockTimestamp,

    writeAsync,
    estimateFee: () => {},
  };
};
