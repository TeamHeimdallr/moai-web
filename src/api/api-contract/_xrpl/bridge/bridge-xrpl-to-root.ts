import { parseUnits } from 'viem';
import { useMutation } from 'wagmi';
import { convertStringToHex, xrpToDrops } from 'xrpl';

import { XRPL_BRIDGE_ADDRESS } from '~/constants';

import { useConnectedWallet } from '~/hooks/wallets';

import { useAccountInfo } from '../account/account-info';

interface Props {
  fromInput: number;

  toAddress: string;
  enabled?: boolean;
}
export const useBridgeXrplToRoot = ({ fromInput, toAddress, enabled }: Props) => {
  const { xrp } = useConnectedWallet();
  const { address, connectedConnector } = xrp;

  const { accountInfo } = useAccountInfo({ account: address, enabled: !!address });
  const sequence = accountInfo?.account_data.Sequence;

  const txRequest = {
    TransactionType: 'Payment',
    Account: address,
    Destination: XRPL_BRIDGE_ADDRESS,
    Amount: xrpToDrops(fromInput),
    Fee: '100',
    Sequence: connectedConnector === 'dcent' ? sequence : undefined,
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

  if (data) {
    if (typeof data.Amount === 'object') {
      data.bridgeAmountTo = parseUnits(data.Amount.value || 0, 6);
    } else {
      data.bridgeAmountTo = data.Amount || 0;
    }
    if (typeof data.SendMax === 'object') {
      data.bridgeAmountFrom = parseUnits(data.SendMax.value || 0, 6);
    } else {
      data.bridgeAmountFrom = data.SendMax || 0;
    }
  }

  const blockTimestamp = data?.date
    ? (data?.date || 0) * 1000 + new Date('2000-01-01').getTime()
    : new Date().getTime();

  const writeAsync = async () => {
    if (!enabled || !address) return;
    await mutateAsync();
  };

  return {
    isLoading,
    isSuccess,
    isError,

    txData: data,
    blockTimestamp,

    bridge: writeAsync,
    reset,
    estimateFee: () => 0.000015,
  };
};
