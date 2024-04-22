import { useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { parseUnits, toHex } from 'viem';
import { AMMDeposit } from 'xrpl';

import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr, getNetworkFull, getTokenDecimal, xrplForceDecimal } from '~/utils';
import { ITokenComposition, NETWORK } from '~/types';

import { useAccountInfo } from '../account/account-info';

interface Props {
  poolId: string;
  token1: ITokenComposition & { balance: number; amount: number };
  token2: ITokenComposition & { balance: number; amount: number };
  enabled?: boolean;
}
export const useAddLiquidity = ({ poolId, token1, token2, enabled }: Props) => {
  const { network } = useParams();
  const { selectedNetwork, isXrp } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);

  const { xrp } = useConnectedWallet();
  const { address, connectedConnector } = xrp;

  const tokens = [token1, token2].filter(t => !!t);
  const isSingle = tokens.filter(t => t?.amount > 0)?.length === 1;

  const { data: poolData } = useGetPoolQuery(
    {
      params: {
        poolId,
        networkAbbr: currentNetworkAbbr as string,
      },
    },
    { enabled: !!poolId && !!currentNetworkAbbr, staleTime: 3000 }
  );
  const { pool } = poolData ?? {};
  const { compositions } = pool || {};

  const getTxRequestAssets = () => {
    const xrp = tokens?.find(t => t.currency === 'XRP');

    if (xrp) {
      const asset1 = { currency: 'XRP' };
      const amount1 = parseUnits(
        xrplForceDecimal(xrp?.amount || 0).toString(),
        getTokenDecimal(NETWORK.XRPL, 'XRP')
      ).toString();

      const remain = tokens.filter(t => t.currency !== 'XRP')?.[0];
      const remainToken = compositions?.filter(t => t.currency !== 'XRP')?.[0];
      const asset2 = {
        issuer: remainToken?.address || '',
        currency: remainToken?.currency || '',
      };
      const amount2 = {
        ...asset2,
        value: xrplForceDecimal(remain?.amount || 0).toString(),
      };

      if (isSingle) {
        const token = tokens.find(t => t?.amount > 0);
        const amount = token?.symbol === 'XRP' ? amount1 : amount2;
        return {
          Amount: amount,
          Asset: asset1,
          Asset2: asset2,
        };
      }

      return {
        Amount: amount1,
        Amount2: amount2,
        Asset: asset1,
        Asset2: asset2,
      };
    }

    const asset1 = {
      issuer: compositions?.[0]?.address || '',
      currency: compositions?.[0]?.currency || '',
    };
    const amount1 = { ...asset1, value: xrplForceDecimal(token1?.amount || 0).toString() };
    const asset2 = {
      issuer: compositions?.[1]?.address ?? '',
      currency: compositions?.[1]?.currency || '',
    };
    const amount2 = { ...asset2, value: xrplForceDecimal(token2?.amount || 0).toString() };

    if (isSingle) {
      const token = tokens.find(t => t?.amount > 0);
      const amount = [amount1, amount2].find(a => a?.currency === token?.currency) || amount1;
      return {
        Amount: amount,
        Asset: asset1,
        Asset2: asset2,
      };
    }

    return {
      Amount: amount1,
      Amount2: amount2,
      Asset: asset1,
      Asset2: asset2,
    };
  };

  const { accountInfo } = useAccountInfo({ account: address, enabled: isXrp && !!address });
  const sequence = accountInfo?.account_data.Sequence;

  const txAssets = getTxRequestAssets();
  const txRequestTwoAssets = {
    TransactionType: 'AMMDeposit',
    Account: address,
    ...txAssets,
    Fee: '100',
    SourceTag: 60006000,
    Flags: connectedConnector === 'dcent' ? toHex(1048576 + 2147483648) : 1048576,
    Sequence: connectedConnector === 'dcent' ? sequence : undefined,
  } as AMMDeposit;
  const txRequestSingleAsset = {
    TransactionType: 'AMMDeposit',
    Account: address,
    ...txAssets,
    Fee: '100',
    SourceTag: 60006000,
    Flags: connectedConnector === 'dcent' ? toHex(524288 + 2147483648) : 524288,
    Sequence: connectedConnector === 'dcent' ? sequence : undefined,
  } as AMMDeposit;
  const txRequest = isSingle ? txRequestSingleAsset : txRequestTwoAssets;

  const submitTx = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await xrp.submitTransaction(txRequest as any);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, isSuccess, isError, mutateAsync } = useMutation<any>(
    ['XRPL', 'ADD_LP'],
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
    estimateFee: () => 0.00005,
  };
};
