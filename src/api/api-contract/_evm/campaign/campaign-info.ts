import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Abi, Address } from 'viem';
import { useContractRead } from 'wagmi';

import { CAMPAIGN_ADDRESS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { getNetworkFull } from '~/utils';
import { useSelecteNetworkStore } from '~/states/data';
import { NETWORK } from '~/types';

import { CAMPAIGN_ABI } from '~/abi/campaign';

export const useCampaignInfo = () => {
  const { selectNetwork } = useSelecteNetworkStore();

  const { network } = useParams();
  const { selectedNetwork, isEvm } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  useEffect(() => {
    selectNetwork(NETWORK.THE_ROOT_NETWORK);
    return;
  }, [selectNetwork]);

  const { data, refetch: userLockupPeriodRefetch } = useContractRead({
    address: CAMPAIGN_ADDRESS[selectedNetwork] as Address,
    abi: CAMPAIGN_ABI as Abi,
    functionName: 'userLockupPeriod',
    chainId,
    args: [],

    staleTime: 1000 * 3,
    enabled: selectedNetwork === NETWORK.THE_ROOT_NETWORK && !!chainId && isEvm,
  });

  const refetch = () => {
    userLockupPeriodRefetch();
  };

  return {
    refetch,
    lockupPeriod: Number(data ?? 60 * 60 * 24),
  };
};
