import { zeroAddress } from 'viem';

import { useWithdrawLiquidity as useWithdrawLiquidityEvm } from '~/api/api-contract/_evm/pool/withdraw-liquidity';
import { useWithdrawLiquidity as useWithdrawLiquidityFpass } from '~/api/api-contract/_evm/pool/withdraw-liquidity-fpass';
import { useWithdrawLiquidity as useWithdrawLiquidityXrp } from '~/api/api-contract/_xrpl/pool/withdraw-liquidity';

import { useNetwork } from '~/hooks/contexts/use-network';
import { getWrappedTokenAddress } from '~/utils';
import { ITokenComposition, NETWORK } from '~/types';

interface Props {
  id: string;
  tokens: (ITokenComposition & { amount: number })[];
  bptIn: bigint;
}

export const useWithdrawLiquidity = ({ id, tokens, bptIn }: Props) => {
  const { isEvm, isFpass } = useNetwork();

  const handleEvmWrappedTokenAddress = (address?: string) => {
    if (!address) return '';
    if (address === getWrappedTokenAddress(NETWORK.EVM_SIDECHAIN)) return zeroAddress;
    return address;
  };
  const resEvm = useWithdrawLiquidityEvm({
    poolId: id,
    tokens: tokens?.map(t => ({ ...t, address: handleEvmWrappedTokenAddress(t.address) })) || [],
    bptIn: BigInt(bptIn),
  });

  const resFpass = useWithdrawLiquidityFpass({
    poolId: id,
    tokens,
    bptIn: BigInt(bptIn),
  });

  const resXrp = useWithdrawLiquidityXrp({
    token1: tokens[0],
    token2: tokens[1],
  });

  return isFpass ? resFpass : isEvm ? resEvm : resXrp;
};
