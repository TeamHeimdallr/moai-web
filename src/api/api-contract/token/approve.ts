import { formatUnits } from 'viem';
import { Address } from 'wagmi';

import { useApprove as useApproveEvm } from '~/api/api-contract/_evm/token/approve';
import { useApprove as useApproveFpass } from '~/api/api-contract/_evm/token/approve-substrate';
import { useApprove as useApproveXrp } from '~/api/api-contract/_xrpl/token/approve';

import { useNetwork } from '~/hooks/contexts/use-network';

interface Props {
  amount: bigint;
  symbol: string;
  address: string; // token address, for evm
  issuer: string; // token isser, for xrp

  spender?: string; // for evm
  currency?: string; // for xrp

  chainId?: number;
  enabled?: boolean;
}

export const useApprove = ({
  amount,
  symbol,
  address,
  issuer,
  spender,
  currency,
  chainId,
  enabled,
}: Props) => {
  const { isEvm, isFpass } = useNetwork();

  const resEvm = useApproveEvm({
    amount: BigInt(amount) * 10n,
    allowanceMin: amount,
    symbol,
    spender: spender as Address,
    chainId,
    tokenAddress: address as Address,
    enabled,
  });

  const resFpass = useApproveFpass({
    amount: BigInt(amount) * 10n,
    allowanceMin: amount,
    symbol,
    spender: spender as Address,
    tokenAddress: address as Address,
    enabled,
  });

  const resXrp = useApproveXrp({
    amount: Number(formatUnits(amount, 6)),
    issuer,
    currency: currency ?? '',
    enabled,
  });

  return isFpass ? resFpass : isEvm ? resEvm : resXrp;
};
