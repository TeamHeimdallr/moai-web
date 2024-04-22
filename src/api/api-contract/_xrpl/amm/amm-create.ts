import { useMutation } from '@tanstack/react-query';
import { AMMCreate, Amount } from 'xrpl';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';

interface Props {
  asset: Amount;
  asset2: Amount;
  trandingFee: number;

  enabled?: boolean;
}
export const useAmmCreate = ({ asset, asset2, trandingFee, enabled = true }: Props) => {
  const { xrp } = useConnectedWallet();
  const { isXrp } = useNetwork();
  const address = xrp?.address;

  const tx = {
    TransactionType: 'AMMCreate',
    Account: address,
    // TODO: decimal 6강제 고정
    Amount: asset,
    Amount2: asset2,
    Fee: '2000000',
    SourceTag: 60006000,
    TradingFee: trandingFee * 10 ** 3,
  } as AMMCreate;

  const submitTx = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await xrp.submitTransaction(tx as any);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, isSuccess, isError, mutateAsync } = useMutation<any>(
    ['XRPL', 'CREATE_AMM'],
    submitTx
  );

  const blockTimestamp = data?.date
    ? (data?.date || 0) * 1000 + new Date('2000-01-01').getTime()
    : new Date().getTime();

  const writeAsync = async () => {
    if (!address || !isXrp || !enabled) return;
    await mutateAsync?.();
  };

  const error = data?.meta?.TransactionResult !== 'tesSUCCESS';

  return {
    isLoading,
    isSuccess,
    isError: isError || error,

    txData: data,
    blockTimestamp,

    writeAsync,
    estimateFee: () => 2,
  };
};
