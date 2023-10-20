import { useWithdrawLiquidity as useWithdrawLiquidityEvm } from '~/api/api-contract/_evm/pool/withdraw-liquidity';
import { useWithdrawLiquidity as useWithdrawLiquidityXrp } from '~/api/api-contract/_xrpl/pool/withdraw-liquidity';

import { useNetwork } from '~/hooks/contexts/use-network';

interface Props {
  id: string;
  tokens: {
    address?: string; // or issuer
    currency?: string;
    amount: string;
  }[];
  amount?: bigint;
}

export const useWithdrawLiquidity = ({ id, tokens, amount }: Props) => {
  const { isEvm } = useNetwork();

  const resEvm = useWithdrawLiquidityEvm({
    poolId: id,
    tokens: tokens?.map(t => t?.address ?? '') ?? [],
    amount: amount ?? 0n,
  });

  const resXrp = useWithdrawLiquidityXrp({
    id,
    token1: {
      issuer: tokens?.[0]?.address ?? '',
      amount: tokens?.[0]?.amount ?? '0',
      currency: tokens?.[0]?.currency ?? '',
    },
    token2: {
      issuer: tokens?.[1]?.address ?? '',
      amount: tokens?.[1]?.amount ?? '0',
      currency: tokens?.[1]?.currency ?? '',
    },
  });

  return isEvm ? resEvm : resXrp;
};
