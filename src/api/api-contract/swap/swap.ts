import { useParams } from 'react-router-dom';
import { parseUnits } from 'viem';
import { Address } from 'wagmi';

import { useSwap as useSwapFpass } from '~/api/api-contract/_evm/swap/fpass-swap';
import { useSwap as useSwapEvm } from '~/api/api-contract/_evm/swap/swap';
import { useSwap as useSwapXrp } from '~/api/api-contract/_xrpl/swap/swap';

import { EVM_TOKEN_ADDRESS, TOKEN_DECIMAL } from '~/constants';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { useSlippageStore } from '~/states/data';
import { NETWORK, SwapKind } from '~/types';

interface Props {
  id: string;

  fromToken: string; // token symbol
  fromValue: number;

  toToken: string; // token symbol
  toValue?: number;
  proxyEnabled?: boolean;
}
export const useSwap = ({ id, fromToken, fromValue, toToken, toValue, proxyEnabled }: Props) => {
  const { network } = useParams();
  const { selectedNetwork, isEvm, isFpass } = useNetwork();
  const { slippage } = useSlippageStore();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const { evm, fpass } = useConnectedWallet();
  const evmAddress = evm?.address ?? '';
  const fpassAddress = fpass?.address ?? '';

  const evmFromToken = () => {
    if (currentNetwork !== NETWORK.EVM_SIDECHAIN)
      return EVM_TOKEN_ADDRESS?.[currentNetwork]?.[fromToken];

    if (
      EVM_TOKEN_ADDRESS?.[currentNetwork]?.[fromToken] === EVM_TOKEN_ADDRESS?.[currentNetwork]?.XRP
    )
      return EVM_TOKEN_ADDRESS?.[currentNetwork]?.ZERO ?? '';
    return EVM_TOKEN_ADDRESS?.[currentNetwork]?.[fromToken];
  };

  const evmToToken = () => {
    if (currentNetwork !== NETWORK.EVM_SIDECHAIN)
      return EVM_TOKEN_ADDRESS?.[currentNetwork]?.[toToken];

    if (EVM_TOKEN_ADDRESS?.[currentNetwork]?.[toToken] === EVM_TOKEN_ADDRESS?.[currentNetwork]?.XRP)
      return EVM_TOKEN_ADDRESS?.[currentNetwork]?.ZERO ?? '';
    return EVM_TOKEN_ADDRESS?.[currentNetwork]?.[toToken];
  };

  const resEvm = useSwapEvm({
    singleSwap: [
      id as Address, // pool id
      SwapKind.GivenIn,
      evmFromToken(),
      evmToToken(),
      parseUnits(`${fromValue ?? 0}`, TOKEN_DECIMAL[currentNetwork]),
      '0x0',
    ],
    fundManagement: [evmAddress, false, evmAddress, false],
    limit: parseUnits(`${(toValue ?? 0) * (1 - slippage / 100)}`, TOKEN_DECIMAL[currentNetwork]),
  });

  const resFpass = useSwapFpass({
    singleSwap: [
      id as Address, // pool id
      SwapKind.GivenIn,
      evmFromToken(),
      evmToToken(),
      parseUnits(`${fromValue ?? 0}`, TOKEN_DECIMAL[currentNetwork]),
      '0x0',
    ],
    fundManagement: [fpassAddress, false, fpassAddress, false],
    limit: parseUnits(`${(toValue ?? 0) * (1 - slippage / 100)}`, TOKEN_DECIMAL[currentNetwork]),
    proxyEnabled,
  });

  const resXrp = useSwapXrp({
    id,
    fromToken,
    fromValue,
    toToken,
    toValue: toValue ?? 0,
  });

  return isFpass ? resFpass : isEvm ? resEvm : resXrp;
};
