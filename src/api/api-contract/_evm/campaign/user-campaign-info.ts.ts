import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Abi, Address } from 'viem';
import { useContractRead } from 'wagmi';

import { CAMPAIGN_ADDRESS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { useSelecteNetworkStore } from '~/states/data';
import { NETWORK } from '~/types';

import { CAMPAIGN_ABI } from '~/abi/campaign';

export const useUserCampaignInfo = () => {
  const { selectNetwork } = useSelecteNetworkStore();

  const { network } = useParams();
  const { selectedNetwork, isEvm, isFpass } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const { evm, fpass } = useConnectedWallet();
  const { address: walletAddress } = isFpass && fpass.address ? fpass : evm;

  useEffect(() => {
    selectNetwork(NETWORK.THE_ROOT_NETWORK);
    return;
  }, [selectNetwork]);

  const { data, refetch: accureRefetch } = useContractRead({
    address: CAMPAIGN_ADDRESS[selectedNetwork] as Address,
    abi: CAMPAIGN_ABI as Abi,
    functionName: 'simulateAccrue',
    chainId,
    args: [walletAddress],

    staleTime: 1000 * 3,
    enabled: selectedNetwork === NETWORK.THE_ROOT_NETWORK && !!chainId && isEvm,
  });

  const amountFarmedInBPT = data?.[0]['amountFarmed']; // in BPT
  const amountFarmedInXrp = amountFarmedInBPT; // TODO: in XRP

  const refetch = () => {
    accureRefetch();
  };

  return {
    refetch,
    amountFarmedInBPT, // in BPT
    amountFarmedInXrp, // in XRP
  };
};
