import { submitTransaction } from '@gemwallet/api';
import { useMutation } from '@tanstack/react-query';
import { xrpToDrops } from 'xrpl';

import { useConnectXrplWallet } from '~/hooks/wallets/use-connect-xrp-wallet';

import { QUERY_KEYS } from '../../utils/query-keys';
import { useAmmInfo } from '../amm/get-amm-info';

interface Token {
  issuer?: string;
  amount: string;
  currency: string;
}

interface Props {
  account: string;
  request: {
    token1: Token;
    token2: Token;
  };
}
export const useWithdrawLiquidity = ({ account, request }: Props) => {
  const { ammExist } = useAmmInfo(account);
  const { address, isInstalled } = useConnectXrplWallet();

  const { token1, token2 } = request;
  const tokens = [token1, token2];

  const getTxRequestAssets = () => {
    const xrp = tokens.find(t => t.currency === 'XRP');

    if (xrp) {
      const asset1 = { currency: 'XRP' };
      const amount1 = xrpToDrops(xrp.amount ?? 0);

      const remain = tokens.filter(t => t.currency !== 'XRP')?.[0];
      const asset2 = {
        issuer: remain.issuer ?? '',
        currency: remain.currency,
      };
      const amount2 = {
        ...asset2,
        value: remain.amount ?? 0,
      };

      return {
        Amount: amount1,
        Amount2: amount2,
        Asset: asset1,
        Asset2: asset2,
      };
    }

    const asset1 = { issuer: token1.issuer ?? '', currency: token1.currency };
    const amount1 = { ...asset1, value: token1.amount ?? 0 };
    const asset2 = { issuer: token2.issuer ?? '', currency: token2.currency };
    const amount2 = { ...asset2, value: token2.amount ?? 0 };

    return {
      Amount: amount1,
      Amount2: amount2,
      Asset: asset1,
      Asset2: asset2,
    };
  };

  const txAssets = getTxRequestAssets();
  const txRequest = {
    TransactionType: 'AMMWithdraw',
    Account: address,
    ...txAssets,
    Fee: '100',
    Flags: 1048576, // tfTwoAsset
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitTx = async () => await submitTransaction({ transaction: txRequest as any });

  const { data, isLoading, isSuccess, mutateAsync } = useMutation(
    QUERY_KEYS.AMM.WITHDRAW_LIQUIDITY,
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

    txData,
    blockTimestamp,

    writeAsync,
  };
};
