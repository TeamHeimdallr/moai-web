import { Address } from 'wagmi';

import { useTokenSymbols as useTokenSymbolsEvm } from '~/api/api-contract/_evm/token/symbol';
import { useTokenSymbols as useTokenSymbolsXrp } from '~/api/api-contract/_xrpl/token/symbol';

import { useNetwork } from '~/hooks/contexts/use-network';

interface Props {
  addresses: string[];
}
export const useTokenSymbols = ({ addresses }: Props) => {
  const { isEvm } = useNetwork();

  const resEvm = useTokenSymbolsEvm(addresses as Address[]);
  const resXrp = useTokenSymbolsXrp(addresses);

  return isEvm ? resEvm : resXrp;
};
