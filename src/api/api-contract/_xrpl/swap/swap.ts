import { parseUnits, toHex } from 'viem';
import { useMutation } from 'wagmi';
import { xrpToDrops } from 'xrpl';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { useSlippageStore } from '~/states/data';
import { IToken } from '~/types';

import { useAccountInfo } from '../account/account-info';

interface Props {
  fromToken: IToken;
  fromInput: number;

  toToken: IToken;
  toInput: number;

  enabled?: boolean;
}
export const useSwap = ({ fromToken, fromInput, toToken, toInput, enabled }: Props) => {
  const { isXrp } = useNetwork();
  const { xrp } = useConnectedWallet();
  const { slippage: slippageRaw } = useSlippageStore();

  const { address, connectedConnector } = xrp;

  const slippage = Number(slippageRaw || 0);
  const amount =
    toToken.symbol === 'XRP'
      ? { Amount: xrpToDrops(toInput.toFixed(6)) }
      : {
          Amount: {
            currency: toToken.currency,
            issuer: toToken.address,
            value: toInput.toFixed(6),
          },
        };

  const deliverMin =
    toToken.symbol === 'XRP'
      ? { DeliverMin: xrpToDrops((toInput * (1 - slippage / 100)).toFixed(6)) }
      : {
          DeliverMin: {
            currency: toToken.currency,
            issuer: toToken.address,
            value: (toInput * (1 - slippage / 100)).toFixed(6),
          },
        };

  const sendMax =
    fromToken.symbol === 'XRP'
      ? { SendMax: xrpToDrops(fromInput.toFixed(6)) }
      : {
          SendMax: {
            currency: fromToken.currency,
            issuer: fromToken.address,
            value: fromInput.toFixed(6),
          },
        };

  const { accountInfo } = useAccountInfo({ account: address, enabled: isXrp && !!address });
  const sequence = accountInfo?.account_data.Sequence;

  const txRequest = {
    TransactionType: 'Payment',
    Account: address,
    ...amount,
    ...sendMax,
    ...deliverMin,
    Destination: address,
    Fee: '100',
    Flags: connectedConnector === 'dcent' ? toHex(131072 + 2147483648) : 131072,
    Sequence: connectedConnector === 'dcent' ? sequence : undefined,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitTx = async () => await xrp.submitTransaction(txRequest as any);

  const { data, isLoading, isSuccess, isError, mutateAsync } = useMutation(
    ['XRPL', 'SWAP'],
    submitTx
  );

  if (data) {
    if (typeof data.Amount === 'object') {
      data.swapAmountTo = parseUnits(data.Amount.value, 6);
    } else {
      data.swapAmountTo = data.Amount;
    }
    if (typeof data.SendMax === 'object') {
      data.swapAmountFrom = parseUnits(data.SendMax.value, 6);
    } else {
      data.swapAmountFrom = data.SendMax;
    }
  }

  const blockTimestamp = data?.date
    ? (data?.date || 0) * 1000 + new Date('2000-01-01').getTime()
    : new Date().getTime();

  const writeAsync = async () => {
    if (!enabled || !address || !isXrp) return;
    await mutateAsync();
  };

  const error = data?.meta?.TransactionResult !== 'tesSUCCESS';

  return {
    isLoading,
    isSuccess,
    isError: isError || error,

    txData: data,
    blockTimestamp,

    swap: writeAsync,
    estimateFee: () => 0.00005,
  };
};
