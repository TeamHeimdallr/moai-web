import { useParams } from 'react-router-dom';
import { parseUnits } from 'viem';
import { Address } from 'wagmi';

import { useBatchSwap as useBatchSwapEvm } from '~/api/api-contract/_evm/swap/batch-swap';
import { useBatchSwap as useBatchSwapFpass } from '~/api/api-contract/_evm/swap/substrate-batch-swap';
import { useSwap as useSwapFpass } from '~/api/api-contract/_evm/swap/substrate-swap';
import { useSwap as useSwapEvm } from '~/api/api-contract/_evm/swap/swap';
import { useSwap as useSwapXrp } from '~/api/api-contract/_xrpl/swap/swap';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull, getTokenDecimal, handleEvmTokenAddress } from '~/utils';
import { useSlippageStore } from '~/states/data';
import { IToken, NETWORK, SwapKind } from '~/types';

interface Props {
  id: string; // deprecated because we use batchswap

  fromToken?: IToken;
  fromInput?: number;

  toToken?: IToken;
  toInput?: number;
  batchSwapSelected?: boolean;
  enabled?: boolean;
}
export const useSwap = ({
  id,
  fromToken,
  fromInput,
  toToken,
  toInput,
  batchSwapSelected,
  enabled,
}: Props) => {
  const { network } = useParams();
  const { selectedNetwork, isXrp, isFpass } = useNetwork();
  const { slippage: slippageRaw } = useSlippageStore();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const isRoot = currentNetwork === NETWORK.THE_ROOT_NETWORK;
  const slippage = Number(slippageRaw || 0);

  const { evm, fpass } = useConnectedWallet();
  const evmFpassAddress = (isRoot ? (isFpass ? fpass?.address : evm?.address) : evm?.address) || '';

  // evm sidechain wxrp 처리
  const handledFromToken = handleEvmTokenAddress(fromToken, currentNetwork);
  const handledToToken = handleEvmTokenAddress(toToken, currentNetwork);

  const resEvm = useBatchSwapEvm({
    fromToken: (handledFromToken?.address || '0x0') as Address,
    toToken: (handledToToken?.address || '0x0') as Address,
    swapAmount: parseUnits(
      `${(fromInput || 0).toFixed(18)}`,
      getTokenDecimal(currentNetwork, fromToken?.symbol)
    ),
    fundManagement: [evmFpassAddress, false, evmFpassAddress, false],
    limit: [
      parseUnits(
        `${(fromInput || 0).toFixed(18)}`,
        getTokenDecimal(currentNetwork, fromToken?.symbol)
      ),
      -parseUnits(
        `${((toInput || 0) * (1 - slippage / 100)).toFixed(18)}`,
        getTokenDecimal(currentNetwork, toToken?.symbol)
      ),
    ],
    enabled: enabled && !isFpass && !!batchSwapSelected,
  });

  const resEvmFpass = useBatchSwapFpass({
    fromToken: (handledFromToken?.address || '0x0') as Address,
    toToken: (handledToToken?.address || '0x0') as Address,
    swapAmount: parseUnits(
      `${(fromInput || 0).toFixed(18)}`,
      getTokenDecimal(currentNetwork, fromToken?.symbol)
    ),
    fundManagement: [evmFpassAddress, false, evmFpassAddress, false],
    limit: [
      parseUnits(
        `${(fromInput || 0).toFixed(18)}`,
        getTokenDecimal(currentNetwork, fromToken?.symbol)
      ),
      -parseUnits(
        `${((toInput || 0) * (1 - slippage / 100)).toFixed(18)}`,
        getTokenDecimal(currentNetwork, toToken?.symbol)
      ),
    ],
    proxyEnabled: enabled && isFpass && !!batchSwapSelected,
  });

  const resEvmSingleSwap = useSwapEvm({
    poolId: id,
    singleSwap: [
      id,
      SwapKind.GivenIn,
      handledFromToken?.address || '',
      handledToToken?.address || '',
      parseUnits(
        `${(fromInput || 0).toFixed(18)}`,
        getTokenDecimal(currentNetwork, fromToken?.symbol)
      ),
      '0x0',
    ],
    fundManagement: [evmFpassAddress, false, evmFpassAddress, false],
    limit: parseUnits(
      `${((toInput || 0) * (1 - slippage / 100)).toFixed(18)}`,
      getTokenDecimal(currentNetwork, toToken?.symbol)
    ),
    enabled: enabled && !isFpass && !!id,
  });

  const resFpassSingleSwap = useSwapFpass({
    poolId: id,
    singleSwap: [
      id,
      SwapKind.GivenIn,
      handledFromToken?.address || '',
      handledToToken?.address || '',
      parseUnits(
        `${(fromInput || 0).toFixed(18)}`,
        getTokenDecimal(currentNetwork, fromToken?.symbol)
      ),
      '0x0',
    ],
    fundManagement: [evmFpassAddress, false, evmFpassAddress, false],
    limit: parseUnits(
      `${((toInput || 0) * (1 - slippage / 100)).toFixed(18)}`,
      getTokenDecimal(currentNetwork, toToken?.symbol)
    ),
    enabled: enabled && isFpass && !!id,
  });

  const resXrp = useSwapXrp({
    fromToken: fromToken || ({} as IToken),
    fromInput: fromInput || 0,

    toToken: toToken || ({} as IToken),
    toInput: toInput || 0,
    enabled,
  });

  const getRes = () => {
    if (isXrp) return resXrp;
    if (isRoot) {
      if (isFpass) {
        if (batchSwapSelected) return resEvmFpass;
        return resFpassSingleSwap;
      }

      if (batchSwapSelected) return resEvm;
      return resEvmSingleSwap;
    }

    if (batchSwapSelected) return resEvm;
    return resEvmSingleSwap;
  };

  return getRes();
};
