import { useParams } from 'react-router-dom';
import { parseUnits } from 'viem';
import { Address } from 'wagmi';

import { useBatchSwap as useBatchSwapFpass } from '~/api/api-contract/_evm/swap/substrate-batch-swap';
// import { useSwap as useSwapFpass } from '~/api/api-contract/_evm/swap/substrate-swap';
import { useSwap as useSwapEvm } from '~/api/api-contract/_evm/swap/swap';
import { useSwap as useSwapXrp } from '~/api/api-contract/_xrpl/swap/swap';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull, getTokenDecimal } from '~/utils';
import { useSlippageStore } from '~/states/data';
import { IToken, SwapKind } from '~/types';

interface Props {
  id: string;

  fromToken?: IToken;
  fromInput?: number;

  toToken?: IToken;
  toInput?: number;
  enabled?: boolean;
}
export const useSwap = ({ id, fromToken, fromInput, toToken, toInput, enabled }: Props) => {
  const { network } = useParams();
  const { selectedNetwork, isEvm, isFpass } = useNetwork();
  const { slippage: slippageRaw } = useSlippageStore();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const slippage = Number(slippageRaw || 0);

  const { evm, fpass } = useConnectedWallet();
  const evmAddress = evm?.address ?? '';
  const fpassAddress = fpass?.address ?? '';

  const resEvm = useSwapEvm({
    poolId: id,
    singleSwap: [
      id,
      SwapKind.GivenIn,
      fromToken?.address || '',
      toToken?.address || '',
      parseUnits(
        `${(fromInput || 0).toFixed(18)}`,
        getTokenDecimal(currentNetwork, fromToken?.symbol)
      ),
      '0x0',
    ],
    fundManagement: [evmAddress, false, evmAddress, false],
    limit: parseUnits(
      `${((toInput ?? 0) * (1 - slippage / 100)).toFixed(18)}`,
      getTokenDecimal(currentNetwork, toToken?.symbol)
    ),
    enabled,
  });

  const resFpass = useBatchSwapFpass({
    fromToken: (fromToken?.address || '0x0') as Address,
    toToken: (toToken?.address || '0x0') as Address,
    swapAmount: parseUnits(
      `${(fromInput ?? 0).toFixed(18)}`,
      getTokenDecimal(currentNetwork, fromToken?.symbol)
    ),
    fundManagement: [fpassAddress, false, fpassAddress, false],
    limit: [
      parseUnits(
        `${(fromInput ?? 0).toFixed(18)}`,
        getTokenDecimal(currentNetwork, fromToken?.symbol)
      ),
      -parseUnits(
        `${((toInput ?? 0) * (1 - slippage / 100)).toFixed(18)}`,
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

  return isFpass ? resFpass : isEvm ? resEvm : resXrp;
};
