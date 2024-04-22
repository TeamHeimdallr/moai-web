import { parseUnits, toHex } from 'viem';
import { useMutation } from 'wagmi';
import { Payment, xrpToDrops } from 'xrpl';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { xrplForceDecimal } from '~/utils';
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
      ? { Amount: xrpToDrops(xrplForceDecimal(toInput || 0).toFixed(6)) }
      : {
          Amount: {
            currency: toToken.currency,
            issuer: toToken.address,
            value: xrplForceDecimal(toInput || 0).toString(),
          },
        };

  const deliverMin =
    toToken.symbol === 'XRP'
      ? { DeliverMin: xrpToDrops((toInput * (1 - slippage / 100)).toFixed(6)) }
      : {
          DeliverMin: {
            currency: toToken.currency,
            issuer: toToken.address,
            value: xrplForceDecimal((toInput || 0) * (1 - slippage / 100)).toString(),
          },
        };

  const sendMax =
    fromToken.symbol === 'XRP'
      ? { SendMax: xrpToDrops(xrplForceDecimal(fromInput || 0).toFixed(6)) }
      : {
          SendMax: {
            currency: fromToken.currency,
            issuer: fromToken.address,
            value: xrplForceDecimal(fromInput || 0).toString(),
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
    SourceTag: 60006000,
    Flags: connectedConnector === 'dcent' ? toHex(131072 + 2147483648) : 131072,
    Sequence: connectedConnector === 'dcent' ? sequence : undefined,
  } as Payment;

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
