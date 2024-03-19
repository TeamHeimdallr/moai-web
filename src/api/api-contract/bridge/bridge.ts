import { parseUnits } from 'viem';

import { useSelectNetwork } from '~/pages/bridge/hooks/use-select-network';
import { useSelectToken } from '~/pages/bridge/hooks/use-select-token';
import { getRootTokenIdFromTokenSymbol } from '~/pages/bridge/utils/token';

import { useNetwork } from '~/hooks/contexts/use-network';

import { useBridgeEthToRoot } from '../_evm/bridge/bridge-eth-to-root';
import { useBridgeRootToEth } from '../_evm/bridge/bridge-root-to-eth';
import { useBridgeRootToEthSubstrate } from '../_evm/bridge/bridge-root-to-eth-substrate';
import { useBridgeRootToXrpl } from '../_evm/bridge/bridge-root-to-xrpl';
import { useBridgeRootToXrplSubstrate } from '../_evm/bridge/bridge-root-to-xrpl-substrate';
import { useBridgeXrplToRoot } from '../_xrpl/bridge/bridge-xrpl-to-root';

interface Props {
  amount: number; // XRP amount, formatted 6 decimal
  destination: string; // XRP address

  enabled?: boolean;
}

export const useBridge = ({ amount, destination, enabled }: Props) => {
  const { isFpass } = useNetwork();

  const { from, to } = useSelectNetwork();
  const { token } = useSelectToken();

  const tokenId = getRootTokenIdFromTokenSymbol(token?.symbol || '');

  const isRootToEth = from === 'THE_ROOT_NETWORK' && to === 'ETHEREUM';
  const isEthToRoot = from === 'ETHEREUM' && to === 'THE_ROOT_NETWORK';

  const isRootToXrpl = from === 'THE_ROOT_NETWORK' && to === 'XRPL';
  const isXrplToRoot = from === 'XRPL' && to === 'THE_ROOT_NETWORK';

  const resRootToEth = useBridgeRootToEth({
    amount: parseUnits((amount || 0).toString(), token?.decimal || 18),
    destination,
    tokenId,
    enabled: isRootToEth && !isFpass && enabled,
  });
  const resRootToEthSubstrate = useBridgeRootToEthSubstrate({
    amount: parseUnits((amount || 0).toString(), token?.decimal || 18),
    destination,
    tokenId,
    enabled: isRootToEth && isFpass && enabled,
  });

  const resEthToRoot = useBridgeEthToRoot({
    amount: parseUnits((amount || 0).toString(), token?.decimal || 18),
    destination,
    tokenId,
    enabled: isEthToRoot && enabled,
  });

  const resRootToXrpl = useBridgeRootToXrpl({
    amount: parseUnits((amount || 0).toString(), token?.decimal || 18),
    destination,
    enabled: isRootToXrpl && !isFpass && enabled,
  });

  const resRootToXrplSubstrate = useBridgeRootToXrplSubstrate({
    amount: parseUnits((amount || 0).toString(), token?.decimal || 18),
    destination,
    enabled: isRootToXrpl && isFpass && enabled,
  });

  const resXrplToRoot = useBridgeXrplToRoot({
    amount,
    destination,
    enabled: isXrplToRoot && enabled,
  });

  if (isRootToEth) return isFpass ? resRootToEthSubstrate : resRootToEth;
  if (isEthToRoot) return resEthToRoot;
  if (isRootToXrpl) return isFpass ? resRootToXrplSubstrate : resRootToXrpl;
  if (isXrplToRoot) return resXrplToRoot;

  return {
    isPrepareLoading: false,
    isLoading: false,
    isSuccess: false,
    isError: false,

    error: null,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    txData: {} as any,
    blockTimestamp: 0,

    reset: () => {},
    writeAsync: async () => {},
    estimateFee: async () => {},
  };
};
