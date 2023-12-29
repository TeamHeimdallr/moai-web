import { useMutation, useQuery } from '@tanstack/react-query';
import { AccountLinesRequest, TrustSet } from 'xrpl';

import { useXrpl } from '~/hooks/contexts';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';

interface Props {
  currency: string;
  issuer: string;
  amount: number;
  enabled?: boolean;
}
// xrp trust line. use evm’s approve to unify function names.
export const useApprove = ({ currency, issuer, amount, enabled }: Props) => {
  const { isXrp } = useNetwork();
  const { client, isConnected } = useXrpl();
  const { xrp } = useConnectedWallet();
  const { address } = xrp;

  const isNativeXrp = currency?.toLowerCase() === 'xrp';

  const getTrustLinesRequest = {
    command: 'account_lines',
    account: address,
  } as AccountLinesRequest;

  const getTrustLines = async () => {
    if (!isXrp) return [];
    return (await client.request(getTrustLinesRequest))?.result?.lines ?? [];
  };

  const {
    isLoading: isReadLoading,
    data: trustLines,
    refetch,
  } = useQuery(['XRPL', 'TRUST_LINE', address], getTrustLines, {
    staleTime: 0,
    enabled: !!client && isConnected && isXrp,
  });

  const line = trustLines?.find(d => d.currency === currency && d.account === issuer);
  const limit = Number(line?.limit || 0);

  const txRequest = {
    TransactionType: 'TrustSet',
    Account: address,
    Fee: '100',
    Flags: 262144,
    LimitAmount: {
      currency,
      issuer,
      // value: (Number(amount) + Number(line?.balance || 0) + 1).toFixed(6),
      value: (10 ** 10).toFixed(6),
    },
  } as TrustSet;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setTrustLines = async () => await xrp.submitTransaction(txRequest as any);

  const { isLoading, isSuccess, mutateAsync } = useMutation(
    ['XRPL', 'SET_TRUST_LINE'],
    setTrustLines
  );

  const allow = async () => {
    if (!isXrp || !issuer || isNativeXrp || !enabled) return;

    await mutateAsync();
  };

  if (isNativeXrp || !enabled) {
    return {
      isLoading: false,
      isSuccess: true,
      allowance: true,
      refetch: async () => {},
      allow: async () => {},
    };
  }
  return {
    isLoading: isLoading || isReadLoading,
    isSuccess,
    allowance: !!line && limit >= Number(amount) + Number(line?.balance || 0),
    refetch,
    allow,
    estimateFee: async () => undefined,
  };
};
