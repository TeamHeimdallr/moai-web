import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BigNumber } from 'ethers';
import { formatUnits } from 'viem';
import {
  Address,
  useContractWrite,
  usePrepareContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from 'wagmi';

import { CAMPAIGN_REWARD_ADDRESS } from '~/constants';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';

import { CAMPAIGN_REWARD_ABI } from '~/abi/campaign-reward.ts';

import { useUserCampaignInfo } from './user-campaign-info.ts';

export const useClaim = () => {
  const publicClient = usePublicClient();

  const { rootReward } = useUserCampaignInfo();

  const { network } = useParams();
  const { evm } = useConnectedWallet();
  const { isConnected, address: walletAddress } = evm;

  const { selectedNetwork, isEvm, isFpass } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const [blockTimestamp, setBlockTimestamp] = useState<number>(0);

  const {
    isLoading: prepareLoading,
    isError: prepareIsError,
    error: prepareError,
    config,
  } = usePrepareContractWrite({
    address: CAMPAIGN_REWARD_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: CAMPAIGN_REWARD_ABI,
    functionName: 'claim',

    account: walletAddress as Address,
    enabled: isConnected && isEvm && !isFpass && !!walletAddress && rootReward > 0,
  });

  const {
    data,
    isLoading: isWriteLoading,
    writeAsync: writeAsyncBase,
    reset,
  } = useContractWrite(config);

  const {
    isLoading,
    isSuccess,
    isError,
    error,
    data: txData,
  } = useWaitForTransaction({
    hash: data?.hash,
    enabled: !!data?.hash && isEvm && !isFpass,
  });

  const getBlockTimestamp = async () => {
    if (!txData || !txData.blockNumber || isFpass) return;

    const { timestamp } = await publicClient.getBlock({ blockNumber: txData.blockNumber });
    setBlockTimestamp(Number(timestamp) * 1000);
  };

  const writeAsync = async () => {
    await writeAsyncBase?.();
  };

  const getEstimatedGas = async () => {
    if (!isEvm || isFpass || !walletAddress || rootReward <= 0) return;

    const feeHistory = await publicClient.getFeeHistory({
      blockCount: 2,
      rewardPercentiles: [25, 75],
    });

    const gas = await publicClient.estimateContractGas({
      address: CAMPAIGN_REWARD_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
      abi: CAMPAIGN_REWARD_ABI,
      functionName: 'claim',
      account: walletAddress as Address,
    });

    const maxFeePerGas = feeHistory.baseFeePerGas[0] || 7500000000000n;
    const gasCostInEth = BigNumber.from(gas).mul(Number(maxFeePerGas).toFixed());
    const remainder = gasCostInEth.mod(10 ** 12);
    const gasCostInXRP = gasCostInEth.div(10 ** 12).add(remainder.gt(0) ? 1 : 0);
    const gasCostInXrpPriority = (gasCostInXRP.toBigInt() * 11n) / 10n;

    const formatted = Number(formatUnits(gasCostInXrpPriority, 6));
    return formatted;
  };

  useEffect(() => {
    getBlockTimestamp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txData]);

  return {
    isPrepareLoading: prepareLoading,
    isLoading: isLoading || isWriteLoading,
    isSuccess,
    isError: isError || prepareIsError,

    error: error || prepareError,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    txData: txData as any,
    blockTimestamp,

    reset,
    writeAsync,
    estimateFee: async () => {
      // TODO: fee proxy
      if (currentNetwork === NETWORK.THE_ROOT_NETWORK) return getEstimatedGas();

      // TODO: handle evm sidechain
      return 0.0005;
    },
  };
};
