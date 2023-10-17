import { parseUnits } from 'viem';
import { Address } from 'wagmi';

import { useSwap as useSwapEvm } from '~/api/api-contract/_evm/swap/swap';
import { useSwap as useSwapXrp } from '~/api/api-contract/_xrpl/swap/swap';

import { EVM_TOKEN_ADDRESS, TOKEN_DECIMAL } from '~/constants';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { SwapKind } from '~/types';

interface Props {
  id: string;

  fromToken: string; // token symbol
  fromValue: number;

  toToken: string; // token symbol
  toValue?: number;
}
export const useSwap = ({ id, fromToken, fromValue, toToken, toValue }: Props) => {
  const { selectedNetwork, isEvm } = useNetwork();
  const { evm } = useConnectedWallet();
  const evmAddress = evm?.address ?? '';

  const evmFromToken =
    EVM_TOKEN_ADDRESS?.[selectedNetwork]?.[fromToken] === EVM_TOKEN_ADDRESS?.[selectedNetwork]?.XRP
      ? EVM_TOKEN_ADDRESS?.[selectedNetwork]?.ZERO ?? ''
      : EVM_TOKEN_ADDRESS?.[selectedNetwork]?.[fromToken] ?? '';
  const evmToToken =
    EVM_TOKEN_ADDRESS?.[selectedNetwork]?.[toToken] === EVM_TOKEN_ADDRESS?.[selectedNetwork]?.XRP
      ? EVM_TOKEN_ADDRESS?.[selectedNetwork]?.ZERO ?? ''
      : EVM_TOKEN_ADDRESS?.[selectedNetwork]?.[toToken] ?? '';

  const resEvm = useSwapEvm({
    singleSwap: [
      id as Address, // pool id
      SwapKind.GivenIn,
      evmFromToken,
      evmToToken,
      parseUnits(`${fromValue ?? 0}`, TOKEN_DECIMAL[selectedNetwork]),
      '0x0',
    ],
    fundManagement: [evmAddress, false, evmAddress, false],
  });

  const resXrp = useSwapXrp({
    id,
    fromToken,
    fromValue,
    toToken,
    toValue: toValue ?? 0,
  });

  return isEvm ? resEvm : resXrp;
};
