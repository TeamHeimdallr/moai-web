import { submitTransaction } from '@gemwallet/api';
import { useMutation } from 'wagmi';
import { PaymentFlags, xrpToDrops } from 'xrpl';

import { useConnectXrplWallet } from '~/hooks/wallets/use-connect-xrp-wallet';

import { ISSUER } from '~/moai-xrp-ledger/constants';

import { QUERY_KEYS } from '../../utils/query-keys';
import { useAmmInfo } from '../amm/get-amm-info';

interface Props {
  account: string;
  fromToken: string;
  fromValue: number;
  toToken: string;
  toValue: number;
}
export const useSwap = ({ account, fromToken, fromValue, toToken, toValue }: Props) => {
  const { ammExist } = useAmmInfo(account);
  const { address, isInstalled } = useConnectXrplWallet();

  const amount =
    fromToken === 'XRP'
      ? {
          Amount: {
            currency: toToken,
            issuer: ISSUER[toToken],
            value: (toValue * 1.01).toFixed(6),
          },
        }
      : { Amount: xrpToDrops((toValue * 1.01).toFixed(6)) };

  const deliverMin =
    fromToken === 'XRP'
      ? {
          DeliverMin: {
            currency: toToken,
            issuer: ISSUER[toToken],
            value: toValue.toString(),
          },
        }
      : { DeliverMin: xrpToDrops(toValue.toString()) };

  const sendMax =
    fromToken === 'XRP'
      ? { SendMax: xrpToDrops(fromValue.toString()) }
      : {
          SendMax: {
            currency: fromToken,
            issuer: ISSUER[fromToken],
            value: fromValue.toString(),
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
  const submitTx = async () => await submitTransaction({ transaction: txRequest as any });

  const { data, isLoading, isSuccess, isError, mutateAsync } = useMutation(
    QUERY_KEYS.SWAP.SWAP,
    submitTx
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const txData = data?.result as any;
  const blockTimestamp = (txData?.date ?? 0) * 1000 + new Date('2000-01-01').getTime();

  const writeAsync = () => {
    if (!ammExist || !isInstalled) return;
    return mutateAsync();
  };

  return {
    isLoading,
    isSuccess,
    isError,

    txData,
    blockTimestamp,

    swap: writeAsync,
  };
};
