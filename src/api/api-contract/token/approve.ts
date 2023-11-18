import { Address } from 'wagmi';

import { useApprove as useApproveEvm } from '~/api/api-contract/_evm/token/approve';
import { useApprove as useApproveFpass } from '~/api/api-contract/_evm/token/approve-fpass';
import { useApprove as useApproveXrp } from '~/api/api-contract/_xrpl/token/approve';

import { useNetwork } from '~/hooks/contexts/use-network';

interface Props {
  amount: number;
  address: string; // token address, for evm
  issuer: string; // token isser, for xrp

  spender?: string; // for evm
  currency?: string; // for xrp

  enabled?: boolean;
}

export const useApprove = ({ amount, address, issuer, spender, currency, enabled }: Props) => {
  const { isEvm, isFpass } = useNetwork();

  const resEvm = useApproveEvm({
    amount: amount * 100,
    allowanceMin: amount,
    spender: spender as Address,
    tokenAddress: address as Address,
    enabled,
  });

  const resFpass = useApproveFpass({
    amount: amount * 100,
    allowanceMin: amount,
    spender: spender as Address,
    tokenAddress: address as Address,
    enabled,
  });

  const resXrp = useApproveXrp({
    amount,
    issuer,
    currency: currency ?? '',
    enabled,
  });

  return isFpass ? resFpass : isEvm ? resEvm : resXrp;
};
