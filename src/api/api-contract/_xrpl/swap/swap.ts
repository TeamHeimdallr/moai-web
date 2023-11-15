import { useMutation } from 'wagmi';
import { PaymentFlags, xrpToDrops } from 'xrpl';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { useSlippageStore } from '~/states/data';
import { IToken } from '~/types';

interface Props {
  fromToken: IToken;
  fromInput: number;

  toToken: IToken;
  toInput: number;
}
export const useSwap = ({ fromToken, fromInput, toToken, toInput }: Props) => {
  const { isXrp } = useNetwork();
  const { xrp } = useConnectedWallet();
  const { slippage } = useSlippageStore();

  const { address } = xrp;

  const amount =
    toToken.symbol === 'XRP'
      ? {
          Amount: {
            currency: toToken.currency,
            issuer: toToken.address,
            value: toInput.toFixed(6),
          },
        }
      : { Amount: xrpToDrops(toInput.toFixed(6)) };

  const deliverMin =
    toToken.symbol === 'XRP'
      ? {
          DeliverMin: {
            currency: toToken.currency,
            issuer: toToken.address,
            value: (toInput * (1 - slippage / 100)).toFixed(6),
          },
        }
      : { DeliverMin: xrpToDrops((toInput * (1 - slippage / 100)).toFixed(6)) };

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

  const txRequest = {
    TransactionType: 'Payment',
    Account: address,
    ...amount,
    ...sendMax,
    ...deliverMin,
    Destination: address,
    Flags: PaymentFlags.tfPartialPayment,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitTx = async () => await xrp.submitTransaction(txRequest as any);

  const { data, isLoading, isSuccess, mutateAsync } = useMutation(['XRPL', 'SWAP'], submitTx);

  const txData = data?.result;
  const blockTimestamp = (txData?.date ?? 0) * 1000 + new Date('2000-01-01').getTime();

  const writeAsync = async () => {
    if (!address || !isXrp) return;
    await mutateAsync();
  };

  return {
    isLoading,
    isSuccess,
    isError: !address || !isXrp,

    txData,
    blockTimestamp,

    swap: writeAsync,
  };
};
