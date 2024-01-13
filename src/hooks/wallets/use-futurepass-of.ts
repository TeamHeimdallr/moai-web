import { useEffect } from 'react';
import { zeroAddress } from 'viem';
import { Address, useAccount, useContractRead } from 'wagmi';

import { IS_MAINNET } from '~/constants';

import { useTheRootNetworkSwitchWalletStore } from '~/states/contexts/wallets/switch-wallet';
import { NETWORK } from '~/types';

import { FUTUREPASS_REGISTER_ABI } from '~/abi/futurepass-register';

import { useNetwork } from '../contexts/use-network';

interface Props {
  enabled?: boolean;
}

const FUTUREPASS_REGISTER = IS_MAINNET
  ? '0x000000000000000000000000000000000000FFff'
  : '0x000000000000000000000000000000000000FFff';
export const useFuturepassOf = ({ enabled }: Props) => {
  const { selectedNetwork } = useNetwork();
  const { address: walletAddress } = useAccount();

  const { selectedWallet: selectedWalletTRN, selectWallet } = useTheRootNetworkSwitchWalletStore();

  const isRoot = selectedNetwork === NETWORK.THE_ROOT_NETWORK;

  const internalEnabled = enabled && !!walletAddress && isRoot;
  const {
    data: _data,
    isFetchedAfterMount: isFetched,
    refetch,
    ...rest
  } = useContractRead({
    address: FUTUREPASS_REGISTER as Address,
    abi: FUTUREPASS_REGISTER_ABI,
    functionName: 'futurepassOf',
    args: [walletAddress],
    enabled: internalEnabled,
  });

  const data = _data as `0x${string}` | undefined;

  useEffect(() => {
    if (!internalEnabled || !isFetched) return;

    if ((!data || data === zeroAddress) && selectedWalletTRN === 'fpass') {
      selectWallet('evm');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, internalEnabled, isFetched, selectedWalletTRN]);

  return { data, refetch, ...rest };
};
