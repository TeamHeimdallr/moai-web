import { useAddLiquidity as useAddLiquidityEvm } from '~/api/api-contract/_evm/pool/add-liquidity';
import { useAddLiquidity as useAddLiquidityXrp } from '~/api/api-contract/_xrpl/pool/add-liquidity';

import { useNetwork } from '~/hooks/contexts/use-network';

interface Props {
  id: string;
  tokens: {
    address?: string; // or issuer
    currency?: string;
    amount: string;
  }[];
  enabled?: boolean;
}

export const useAddLiquidity = ({ id, tokens, enabled }: Props) => {
  const { isEvm } = useNetwork();

  const resEvm = useAddLiquidityEvm({
    poolId: id,
    tokens: tokens?.map(t => t?.address ?? '') ?? [],
    amountsIn: tokens?.map(t => BigInt(t?.amount || '0')) ?? [],
    enabled,
  });
  const resXrp = useAddLiquidityXrp({
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
    enabled,
  });

  return isEvm ? resEvm : resXrp;
};
