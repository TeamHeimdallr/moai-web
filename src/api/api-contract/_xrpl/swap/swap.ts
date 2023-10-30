import { useMutation } from 'wagmi';
import { PaymentFlags, xrpToDrops } from 'xrpl';

import { QUERY_KEYS } from '~/api/utils/query-keys';

import { XRP_TOKEN_ISSUER } from '~/constants';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { useSlippageStore } from '~/states/data';

import { useAmmInfo } from '../amm/get-amm-info';

interface Props {
  id: string;

  fromToken: string;
  fromValue: number;

  toToken: string;
  toValue: number;
}
export const useSwap = ({ id, fromToken, fromValue, toToken, toValue }: Props) => {
  const { isXrp } = useNetwork();
  const { ammExist } = useAmmInfo(id);
  const { xrp } = useConnectedWallet();
  const { address } = xrp;
  const { slippage } = useSlippageStore();

  const amount =
    fromToken === 'XRP'
      ? {
          Amount: {
            currency: toToken,
            issuer: XRP_TOKEN_ISSUER[toToken],
            value: toValue.toFixed(6),
          },
        }
      : { Amount: xrpToDrops(toValue.toFixed(6)) };

  const deliverMin =
    fromToken === 'XRP'
      ? {
          DeliverMin: {
            currency: toToken,
            issuer: XRP_TOKEN_ISSUER[toToken],
            value: (toValue * (1 - slippage / 100)).toFixed(6),
          },
        }
      : { DeliverMin: xrpToDrops((toValue * (1 - slippage / 100)).toFixed(6)) };

  const sendMax =
    fromToken === 'XRP'
      ? { SendMax: xrpToDrops(fromValue.toFixed(6)) }
      : {
          SendMax: {
            currency: fromToken,
            issuer: XRP_TOKEN_ISSUER[fromToken],
            value: fromValue.toFixed(6),
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

  const { data, isLoading, isSuccess, mutateAsync } = useMutation(QUERY_KEYS.SWAP.SWAP, submitTx);

  const txData = data?.result;
  const blockTimestamp = (txData?.date ?? 0) * 1000 + new Date('2000-01-01').getTime();

  const writeAsync = async () => {
    if (!ammExist || !address || !isXrp) return;
    await mutateAsync();
  };

  return {
    isLoading,
    isSuccess,
    isError: !ammExist || !address || !isXrp,

    txData,
    blockTimestamp,

    swap: writeAsync,
  };
};
