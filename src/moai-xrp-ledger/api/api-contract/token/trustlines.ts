/* eslint-disable @typescript-eslint/no-explicit-any */
import { submitTransaction } from '@gemwallet/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AccountLinesRequest } from 'xrpl';

import { useConnectXrplWallet } from '~/hooks/data/use-connect-xrpl-wallet';
import { useXrplStore } from '~/states/data/xrpl';

import { QUERY_KEYS } from '../../utils/query-keys';

interface Props {
  currency: string;
  issuer: string;
  amount: string;
}
export const useTrustLines = ({ currency, issuer, amount }: Props) => {
  const { client, isConnected } = useXrplStore();
  const { address } = useConnectXrplWallet();

  const getTrustLinesRequest = {
    command: 'account_lines',
    account: address,
  } as AccountLinesRequest;

  const getTrustLInes = async () =>
    (await client.request(getTrustLinesRequest))?.result?.lines ?? [];

  const { data: trustLines, refetch: refetchTrustLines } = useQuery(
    [...QUERY_KEYS.TOKEN.GET_TRUST_LINES, address],
    getTrustLInes,
    {
      staleTime: 5 * 60 * 1000,
      enabled: !!client && isConnected,
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

  return {
    allowance: !!line && limit >= Number(amount) + Number(line?.balance ?? 0),
    allow: mutateAsync,
    refetchTrustLines,
    ...rest,
  };
};
