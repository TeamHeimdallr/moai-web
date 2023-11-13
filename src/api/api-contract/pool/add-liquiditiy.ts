import { useParams } from 'react-router-dom';
import { parseUnits } from 'viem';

import { useAddLiquidity as useAddLiquidityEvm } from '~/api/api-contract/_evm/pool/add-liquidity';
import { useAddLiquidity as useAddLiquidityFpass } from '~/api/api-contract/_evm/pool/add-liquidity-fpass';
import { useAddLiquidity as useAddLiquidityXrp } from '~/api/api-contract/_xrpl/pool/add-liquidity';

import { TOKEN_DECIMAL } from '~/constants';

import { useNetwork } from '~/hooks/contexts/use-network';
import { getNetworkFull } from '~/utils';

interface Props {
  id: string;
  tokens: {
    address?: string;
    issuer?: string;
    currency?: string;
    amount: string;
  }[];
  enabled?: boolean;
}

export const useAddLiquidity = ({ id, tokens, enabled }: Props) => {
  const { network } = useParams();
  const { selectedNetwork, isEvm, isFpass } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const resEvm = useAddLiquidityEvm({
    poolId: id,
    tokens: tokens?.map(t => t?.address ?? '') ?? [],
    amountsIn: tokens?.map(t => parseUnits(t?.amount || '0', TOKEN_DECIMAL[currentNetwork])) ?? [],
    enabled,
  });

  const resFpass = useAddLiquidityFpass({
    poolId: id,
    tokens: tokens?.map(t => t?.address ?? '') ?? [],
    amountsIn: tokens?.map(t => parseUnits(t?.amount || '0', TOKEN_DECIMAL[currentNetwork])) ?? [],
    enabled,
  });

  const resXrp = useAddLiquidityXrp({
    id,
    token1: {
      issuer: tokens?.[0]?.issuer ?? '',
      amount: tokens?.[0]?.amount ?? '0',
      currency: tokens?.[0]?.currency ?? '',
    },
    token2: {
      issuer: tokens?.[1]?.issuer ?? '',
      amount: tokens?.[1]?.amount ?? '0',
      currency: tokens?.[1]?.currency ?? '',
    },
    enabled,
  });

  return isFpass ? resFpass : isEvm ? resEvm : resXrp;
};
