import { useParams } from 'react-router-dom';
import { Address, parseUnits } from 'viem';

import { useWithdrawTokenAmounts as useWithdrawTokenAmountsEvm } from '~/api/api-contract/_evm/pool/get-liquidity-pool-balance';
import { useWithdrawLiquidity as useWithdrawLiquidityEvm } from '~/api/api-contract/_evm/pool/withdraw-liquidity';
import { useWithdrawTokenAmounts as useWithdrawTokenAmountsXrp } from '~/api/api-contract/_xrpl/pool/get-liquidity-pool-balance';
import { useWithdrawLiquidity as useWithdrawLiquidityXrp } from '~/api/api-contract/_xrpl/pool/withdraw-liquidity';

import { TOKEN_DECIMAL } from '~/constants';

import { useNetwork } from '~/hooks/contexts/use-network';
import { getNetworkFull } from '~/utils';

interface Props {
  id: string;
  tokens: {
    address?: string;
    issuer?: string;
    currency?: string;
    amount: number;
  }[];
  amount?: bigint;
}

export const useWithdrawLiquidity = ({ id, tokens, amount }: Props) => {
  const { network } = useParams();
  const { selectedNetwork, isEvm } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const resEvm = useWithdrawLiquidityEvm({
    poolId: id,
    tokens: tokens?.map(t => t?.address ?? '') ?? [],
    amount: parseUnits((amount || '0').toString(), TOKEN_DECIMAL[currentNetwork]),
  });

  const resXrp = useWithdrawLiquidityXrp({
    id,
    token1: {
      issuer: tokens?.[0]?.issuer ?? '',
      amount: tokens?.[0]?.amount?.toString() ?? '0',
      currency: tokens?.[0]?.currency ?? '',
    },
    token2: {
      issuer: tokens?.[1]?.issuer ?? '',
      amount: tokens?.[1]?.amount?.toString() ?? '0',
      currency: tokens?.[1]?.currency ?? '',
    },
  });

  return isEvm ? resEvm : resXrp;
};

interface UseWithdrawTokenAmounts {
  id: string;
  amountIn: number;
}
export const useWithdrawTokenAmounts = ({ id, amountIn }: UseWithdrawTokenAmounts) => {
  const { isEvm } = useNetwork();

  const resEvm = useWithdrawTokenAmountsEvm({ id: id as Address, bptIn: amountIn });
  const resXrp = useWithdrawTokenAmountsXrp({ id, amountIn });

  return isEvm ? resEvm : resXrp;
};
