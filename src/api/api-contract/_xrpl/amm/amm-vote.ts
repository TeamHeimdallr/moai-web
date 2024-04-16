import { useMutation } from '@tanstack/react-query';
import { AMMVote, Currency } from 'xrpl';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';

interface Props {
  asset: Currency;
  asset2: Currency;
  trandingFee: number;

  enabled?: boolean;
}
export const useAmmVote = ({ asset, asset2, trandingFee, enabled = true }: Props) => {
  const { xrp } = useConnectedWallet();
  const { isXrp } = useNetwork();
  const address = xrp?.address;

  const tx = {
    TransactionType: 'AMMVote',
    Account: address,
    Asset: asset,
    Asset2: asset2,
    Flags: 2147483648,
    SourceTag: 60006000,
    TradingFee: trandingFee,
  } as AMMVote;

  const submitTx = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await xrp.submitTransaction(tx as any);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, isSuccess, isIdle, isError, mutateAsync } = useMutation<any>(
    ['XRPL', 'VOTE_AMM'],
    submitTx
  );

  const blockTimestamp = data?.date
    ? (data?.date || 0) * 1000 + new Date('2000-01-01').getTime()
    : new Date().getTime();

  const writeAsync = async () => {
    if (!address || !isXrp || !enabled) return;
    await mutateAsync?.();
  };

  const error = data ? data?.meta?.TransactionResult !== 'tesSUCCESS' : false;

  return {
    isIdle,
    isLoading,
    isSuccess,
    isError: isError || error,

    txData: data,
    blockTimestamp,

    writeAsync,
    estimateFee: () => 0.0001,
  };
};
