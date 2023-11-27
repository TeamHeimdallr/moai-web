import { useParams } from 'react-router-dom';
import { parseUnits } from 'viem';

import { useAddLiquidity as useAddLiquidityEvm } from '~/api/api-contract/_evm/pool/add-liquidity';
import { useAddLiquidity as useAddLiquidityFpass } from '~/api/api-contract/_evm/pool/add-liquidity-substrate';
import { useAddLiquidity as useAddLiquidityXrp } from '~/api/api-contract/_xrpl/pool/add-liquidity';

import { useNetwork } from '~/hooks/contexts/use-network';
import { getNetworkFull, getTokenDecimal } from '~/utils';
import { ITokenComposition } from '~/types';

interface Props {
  id: string;
  tokens: (ITokenComposition & { balance: number; amount: number })[];
  amountsIn?: string[];
  enabled?: boolean;
}

export const useAddLiquidity = ({ id, tokens, enabled }: Props) => {
  const { network } = useParams();
  const { selectedNetwork, isEvm, isFpass } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const resEvm = useAddLiquidityEvm({
    poolId: id,
    tokens:
      tokens?.map(t => ({
        ...t,
        amount: parseUnits((t.amount || 0).toString(), getTokenDecimal(currentNetwork, t.symbol)),
      })) ?? [],
    enabled,
  });

  const resFpass = useAddLiquidityFpass({
    poolId: id,
    tokens:
      tokens?.map(t => ({
        ...t,
        amount: parseUnits((t.amount || 0).toString(), getTokenDecimal(currentNetwork, t.symbol)),
      })) ?? [],
    enabled,
  });

  const resXrp = useAddLiquidityXrp({
    token1: tokens[0],
    token2: tokens[1],
    enabled,
  });

  return isFpass ? resFpass : isEvm ? resEvm : resXrp;
};
