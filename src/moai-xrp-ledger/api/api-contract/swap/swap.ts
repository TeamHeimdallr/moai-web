import { submitTransaction } from '@gemwallet/api';
import { useMutation } from 'wagmi';
import { PaymentFlags, xrpToDrops } from 'xrpl';

import { ISSUER } from '~/moai-xrp-ledger/constants';

import { useConnectXrplWallet } from '~/moai-xrp-ledger/hooks/data/use-connect-xrpl-wallet';

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
            value: toValue.toString(),
          },
        }
      : { Amount: toValue.toString() };

  const sendMax =
    fromToken === 'XRP'
      ? { SendMax: fromValue.toString() }
      : {
          SendMax: {
            currency: fromValue,
            issuer: ISSUER[fromToken],
            value: fromValue.toString(),
          },
        };

  const txRequest = {
    TransactionType: 'Payment',
    Account: address,
    ...amount,
    ...sendMax,
    destination: address,
    Flag: PaymentFlags.tfPartialPayment,
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
