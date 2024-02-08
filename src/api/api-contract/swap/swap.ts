import { useParams } from 'react-router-dom';
import { parseUnits, zeroAddress } from 'viem';
import { Address } from 'wagmi';

import { useBatchSwap as useBatchSwapEvm } from '~/api/api-contract/_evm/swap/batch-swap';
import { useBatchSwap as useBatchSwapFpass } from '~/api/api-contract/_evm/swap/substrate-batch-swap';
import { useSwap as useSwapXrp } from '~/api/api-contract/_xrpl/swap/swap';

import { EVM_TOKEN_ADDRESS } from '~/constants';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull, getTokenDecimal } from '~/utils';
import { useSlippageStore } from '~/states/data';
import { IToken, NETWORK } from '~/types';

interface Props {
  id: string; // deprecated because we use batchswap

  fromToken?: IToken;
  fromInput?: number;

  toToken?: IToken;
  toInput?: number;
  enabled?: boolean;
}
export const useSwap = ({ id: _id, fromToken, fromInput, toToken, toInput, enabled }: Props) => {
  const { network } = useParams();
  const { selectedNetwork, isEvm, isFpass } = useNetwork();
  const { slippage: slippageRaw } = useSlippageStore();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const isRoot = currentNetwork === NETWORK.THE_ROOT_NETWORK;
  const slippage = Number(slippageRaw || 0);

  const { evm, fpass } = useConnectedWallet();
  const evmAddress = evm?.address ?? '';
  const fpassAddress = fpass?.address ?? '';

  // evm sidechain wxrp 처리
  const handledFromToken = fromToken
    ? currentNetwork !== NETWORK.EVM_SIDECHAIN
      ? fromToken
      : {
          ...fromToken,
          address:
            fromToken.address === EVM_TOKEN_ADDRESS[currentNetwork].WXRP
              ? zeroAddress
              : fromToken?.address,
        }
    : fromToken;
  const handledToToken = toToken
    ? currentNetwork !== NETWORK.EVM_SIDECHAIN
      ? toToken
      : {
          ...toToken,
          address:
            toToken.address === EVM_TOKEN_ADDRESS[currentNetwork].WXRP
              ? zeroAddress
              : toToken?.address,
        }
    : toToken;

  const resEvm = useBatchSwapEvm({
    fromToken: (handledFromToken?.address || '0x0') as Address,
    toToken: (handledToToken?.address || '0x0') as Address,
    swapAmount: parseUnits(
      `${(fromInput || 0).toFixed(18)}`,
      getTokenDecimal(currentNetwork, fromToken?.symbol)
    ),
    fundManagement: [evmAddress, false, evmAddress, false],
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
    enabled,
  });

  const resRootEvm = useBatchSwapEvm({
    fromToken: (fromToken?.address || '0x0') as Address,
    toToken: (toToken?.address || '0x0') as Address,
    swapAmount: parseUnits(
      `${(fromInput || 0).toFixed(18)}`,
      getTokenDecimal(currentNetwork, fromToken?.symbol)
    ),
    fundManagement: [evmAddress, false, evmAddress, false],
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
    enabled,
  });

  const resFpass = useBatchSwapFpass({
    fromToken: (fromToken?.address || '0x0') as Address,
    toToken: (toToken?.address || '0x0') as Address,
    swapAmount: parseUnits(
      `${(fromInput || 0).toFixed(18)}`,
      getTokenDecimal(currentNetwork, fromToken?.symbol)
    ),
    fundManagement: [fpassAddress, false, fpassAddress, false],
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
    proxyEnabled: enabled,
  });

  const resXrp = useSwapXrp({
    fromToken: fromToken || ({} as IToken),
    fromInput: fromInput || 0,

    toToken: toToken || ({} as IToken),
    toInput: toInput || 0,
    enabled,
  });

  return isRoot ? (isFpass ? resFpass : resRootEvm) : isEvm ? resEvm : resXrp;
};
