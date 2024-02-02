import { useParams } from 'react-router-dom';
import { useQuery } from 'wagmi';

import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { useXrpl } from '~/hooks/contexts';
import { useNetwork } from '~/hooks/contexts/use-network';
import { usePrevious } from '~/hooks/utils';
import { IXrplTxInfo } from '~/types';

interface Props {
  amountsIn: number[];
  txHash?: string;
}
export const useCalculateAddLiquidity = ({ txHash }: Props) => {
  const { client, isConnected } = useXrpl();
  const prevHash = usePrevious<string | undefined>(txHash);

  const { network, id } = useParams();
  const { isXrp } = useNetwork();

  const queryEnabled = !!network && !!id;
  const { data: poolData } = useGetPoolQuery(
    {
      params: {
        networkAbbr: network as string,
        poolId: id as string,
      },
    },
    {
      enabled: queryEnabled,
      staleTime: 1000,
    }
  );
  const { pool } = poolData || {};
  const { address } = pool || {};

  const txRequest = {
    command: 'tx',
    transaction: txHash as string,
    binary: false,
  };

  const { data: txRaw } = useQuery<IXrplTxInfo>(
    ['GET', 'XRPL', 'TX', txHash],
    () => client.request(txRequest),
    { enabled: !!client && isConnected && !!txHash && prevHash !== txHash && isXrp }
  );
  const node = txRaw?.result?.meta?.AffectedNodes?.find(
    n =>
      n?.ModifiedNode?.FinalFields?.Account === address &&
      n?.ModifiedNode?.LedgerEntryType === 'AMM'
  )?.ModifiedNode;
  const current = node?.FinalFields?.LPTokenBalance?.value || 0;
  const prev = node?.PreviousFields?.LPTokenBalance?.value || 0;

  if (!isXrp)
    return {
      bptOut: 0,
      priceImpact: 0,
    };

  const bptOut = Number(current) - Number(prev);
  return {
    bptOut,
    priceImpact: 0,
  };
};
