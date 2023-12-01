import { useMutation } from '@tanstack/react-query';
import { parseUnits } from 'viem';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getTokenDecimal } from '~/utils';
import { ITokenComposition, NETWORK } from '~/types';

interface Props {
  token1: ITokenComposition & { balance: number; amount: number };
  token2: ITokenComposition & { balance: number; amount: number };
  enabled?: boolean;
}
export const useAddLiquidity = ({ token1, token2, enabled }: Props) => {
  const { isXrp } = useNetwork();

  const { xrp } = useConnectedWallet();
  const { address } = xrp;

  const tokens = [token1, token2];

  const getTxRequestAssets = () => {
    const xrp = tokens?.find(t => t.currency === 'XRP');

    if (xrp) {
      const asset1 = { currency: 'XRP' };
      const amount1 = Number(
        Number(
          parseUnits((xrp.amount || 0).toFixed(6), getTokenDecimal(NETWORK.XRPL, 'XRP')).toString()
        ).toFixed(5)
      ).toString(); // max decimal is 6

      const remain = tokens.filter(t => t.currency !== 'XRP')?.[0];
      const asset2 = {
        issuer: remain.address || '',
        currency: remain.currency,
      };
      const amount2 = {
        ...asset2,
        value: Number(Number(remain.amount || 0).toFixed(5)).toString(),
      };

      return {
        Amount: amount1,
        Amount2: amount2,
        Asset: asset1,
        Asset2: asset2,
      };
    }

    const asset1 = { issuer: token1?.address || '', currency: token1?.currency || '' };
    const amount1 = { ...asset1, value: Number(Number(token1?.amount || 0).toFixed(5)).toString() };
    const asset2 = { issuer: token2?.address ?? '', currency: token2?.currency || '' };
    const amount2 = { ...asset2, value: Number(Number(token1?.amount || 0).toFixed(5)).toString() };

    return {
      Amount: amount1,
      Amount2: amount2,
      Asset: asset1,
      Asset2: asset2,
    };
  };

  const txAssets = getTxRequestAssets();
  const txRequest = {
    TransactionType: 'AMMDeposit',
    Account: address,
    ...txAssets,
    Flags: 1048576, // tfTwoAsset
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitTx = async () => await xrp.submitTransaction(txRequest as any);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, isSuccess, mutateAsync } = useMutation<any>(
    ['XRPL', 'ADD_LP'],
    submitTx
  );

  const txData = data?.result;
  const blockTimestamp = (txData?.date ?? 0) * 1000 + new Date('2000-01-01').getTime();

  const writeAsync = async () => {
    if (!address || !isXrp || !enabled) return;
    await mutateAsync?.();
  };

  return {
    isLoading,
    isSuccess,

    txData,
    blockTimestamp,

    writeAsync,
  };
};
