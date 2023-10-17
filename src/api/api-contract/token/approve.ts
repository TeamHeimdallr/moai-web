import { Address } from 'wagmi';

import { useApprove as useApproveEvm } from '~/api/api-contract/_evm/token/approve';
import { useApprove as useApproveXrp } from '~/api/api-contract/_xrpl/token/approve';

import { useNetwork } from '~/hooks/contexts/use-network';

interface Props {
  amount: number;
  address: string; // token address / issuer

  spender?: string; // for evm
  currency?: string; // for xrp

  enabled?: boolean;
}

export const useApprove = ({ amount, address, spender, currency, enabled }: Props) => {
  const { isEvm } = useNetwork();

  const resEvm = useApproveEvm({
    amount,
    allowanceMin: amount,
    spender: (spender ?? '0x0') as Address,
    tokenAddress: address as Address,
    enabled,
  });

  const resXrp = useApproveXrp({
    amount,
    issuer: address,
    currency: currency ?? '',
  });

  return isEvm ? resEvm : resXrp;
};
