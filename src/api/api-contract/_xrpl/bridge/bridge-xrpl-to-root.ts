import { parseUnits } from 'viem';
import { useMutation } from 'wagmi';
import { convertStringToHex, xrpToDrops } from 'xrpl';

import { XRPL_BRIDGE_ADDRESS } from '~/constants';

import { useConnectedWallet } from '~/hooks/wallets';

interface Props {
  fromInput: number;

  toAddress: string;
  enabled?: boolean;
}
export const useBridgeXrplToRoot = ({ fromInput, toAddress, enabled }: Props) => {
  const { xrp } = useConnectedWallet();
  const { address, connectedConnector } = xrp;

  const txRequest = {
    TransactionType: 'Payment',
    Account: address,
    Destination: XRPL_BRIDGE_ADDRESS,
    Amount: xrpToDrops(fromInput),
    Memos: [
      {
        Memo: {
          MemoType: convertStringToHex('Address'),
          MemoData: convertStringToHex(toAddress),
        },
      },
    ],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitTx = async () => await xrp.submitTransaction(txRequest as any);

  const { data, isLoading, isSuccess, isError, mutateAsync, reset } = useMutation(
    ['XRPL', 'BRIDGE', 'XRP'],
    submitTx
  );

  const txData =
    connectedConnector === 'gem'
      ? data?.result
      : connectedConnector === 'crossmark'
      ? data?.response?.data?.resp?.result
      : data;
  if (txData) {
    if (typeof txData.Amount === 'object') {
      txData.bridgeAmountTo = parseUnits(txData.Amount.value || 0, 6);
    } else {
      txData.bridgeAmountTo = txData.Amount || 0;
    }
    if (typeof txData.SendMax === 'object') {
      txData.bridgeAmountFrom = parseUnits(txData.SendMax.value || 0, 6);
    } else {
      txData.bridgeAmountFrom = txData.SendMax || 0;
    }
  }

  const blockTimestamp = txData?.date
    ? (txData?.date || 0) * 1000 + new Date('2000-01-01').getTime()
    : new Date().getTime();

  const writeAsync = async () => {
    if (!enabled || !address) return;
    await mutateAsync();
  };

  return {
    isLoading,
    isSuccess,
    isError,

    txData,
    blockTimestamp,

    bridge: writeAsync,
    reset,
    estimateFee: () => 0.000015,
  };
};
