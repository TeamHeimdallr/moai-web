/* eslint-disable @typescript-eslint/no-explicit-any */
import { submitTransaction } from '@gemwallet/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AccountLinesRequest } from 'xrpl';

import { QUERY_KEYS } from '~/api/utils/query-keys';

import { useXrpl } from '~/hooks/contexts';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';

interface Props {
  currency: string;
  issuer: string;
  amount: string;
}
// xrp trust line. use evm’s approve to unify function names.
export const useApprove = ({ currency, issuer, amount }: Props) => {
  const { isXrp } = useNetwork();
  const { client, isConnected } = useXrpl();
  const { xrp } = useConnectedWallet();
  const { address } = xrp;

  const getTrustLinesRequest = {
    command: 'account_lines',
    account: address,
  } as AccountLinesRequest;

  const getTrustLInes = async () => {
    if (!isXrp) return [];
    return (await client.request(getTrustLinesRequest))?.result?.lines ?? [];
  };

  const { data: trustLines, refetch: refetchTrustLines } = useQuery(
    [...QUERY_KEYS.TOKEN.GET_TRUST_LINES, address],
    getTrustLInes,
    {
      staleTime: 5 * 60 * 1000,
      enabled: !!client && isConnected && isXrp,
    }
  );

  const line = trustLines?.find(d => d.currency === currency && d.account === issuer);
  const limit = Number(line?.limit ?? 0);

  const txRequest = {
    TransactionType: 'TrustSet',
    Account: address,
    Fee: '100',
    Flags: 262144,
    LimitAmount: {
      currency,
      issuer,
      value: (Number(amount) + Number(line?.balance ?? 0)).toFixed(6),
    },
  };

  const setTrustLines = async () => await submitTransaction({ transaction: txRequest as any });

  const { mutateAsync, ...rest } = useMutation(QUERY_KEYS.TOKEN.SET_TRUST_LINE, setTrustLines);

  const allow = async () => {
    if (!isXrp) return;

    await mutateAsync();
  };

  return {
    allowance: !!line && limit >= Number(amount) + Number(line?.balance ?? 0),
    allow,
    refetchTrustLines,
    ...rest,
  };
};
