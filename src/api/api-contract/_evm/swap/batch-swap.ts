import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BigNumber } from 'ethers';
import { head, last } from 'lodash-es';
import { Address, decodeEventLog, formatUnits } from 'viem';
import {
  useContractWrite,
  usePrepareContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from 'wagmi';

import { useSorQuery } from '~/api/api-server/sor/batch-swap';

import { EVM_VAULT_ADDRESS } from '~/constants';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { NETWORK, SwapFundManagementInput, SwapKind } from '~/types';

import { BALANCER_VAULT_ABI } from '~/abi';

interface Props {
  fromToken: Address;
  toToken: Address;
  swapAmount: bigint;

  fundManagement: SwapFundManagementInput;
  limit?: bigint[];
  deadline?: number;
  enabled?: boolean;
}

export const useBatchSwap = ({
  fromToken,
  toToken,
  swapAmount,
  fundManagement,
  limit = [BigInt(10)],
  deadline = 2000000000,
  enabled,
}: Props) => {
  const publicClient = usePublicClient();

  const { network } = useParams();
  const { evm } = useConnectedWallet();
  const { address: walletAddress } = evm;

  const { selectedNetwork, isEvm } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const isRoot = currentNetwork === NETWORK.THE_ROOT_NETWORK;
  const isXrpEvm = currentNetwork === NETWORK.EVM_SIDECHAIN;

  const [blockTimestamp, setBlockTimestamp] = useState<number>(0);

  const { data: sorData } = useSorQuery(
    {
      queries: {
        network: currentNetwork,
        from: fromToken,
        to: toToken,
        amount: swapAmount.toString(),
      },
    },
    {
      enabled: !!fromToken && !!toToken && !!swapAmount,
      staleTime: 1000,
    }
  );

  const swapsRaw = sorData?.data.swaps ?? [];
  const swaps = swapsRaw.map(({ poolId, assetInIndex, assetOutIndex, amount, userData }) => [
    poolId,
    assetInIndex,
    assetOutIndex,
    amount,
    userData,
  ]);
  const assets = sorData?.data.tokenAddresses ?? [];
  const internalSwapLength = swaps.length - 1;
  const limits = [limit[0], ...Array.from({ length: internalSwapLength }).map(() => 0n), limit[1]];

  const {
    config,
    isFetching: isPrepareLoading,
    isError: isPrepareError,
    error,
  } = usePrepareContractWrite({
    address: EVM_VAULT_ADDRESS[selectedNetwork] as Address,
    abi: BALANCER_VAULT_ABI,
    functionName: 'batchSwap',
    account: walletAddress as Address,
    args: [SwapKind.GivenIn, swaps, assets, fundManagement, limits, deadline],
    enabled: enabled && isEvm && !!walletAddress && (isRoot || isXrpEvm),
  });

  const { data, isLoading: isWriteLoading, writeAsync } = useContractWrite(config);
  const {
    isLoading,
    isSuccess,
    isError,
    data: txData,
  } = useWaitForTransaction({
    hash: data?.hash,
    enabled: !!data?.hash && isEvm,
  });

  const getBlockTimestamp = async () => {
    if (!txData || !txData.blockNumber || !isEvm) return;

    const { timestamp } = await publicClient.getBlock({ blockNumber: txData.blockNumber });
    setBlockTimestamp(Number(timestamp) * 1000);
  };

  const swap = async () => {
    if (!enabled) return;

    await writeAsync?.();
  };

  const getEstimatedGas = async () => {
    if (!isEvm || !isRoot) return;

    const feeHistory = await publicClient.getFeeHistory({
      blockCount: 2,
      rewardPercentiles: [25, 75],
    });

    const gas = await publicClient.estimateContractGas({
      address: EVM_VAULT_ADDRESS[selectedNetwork] as Address,
      abi: BALANCER_VAULT_ABI,
      functionName: 'batchSwap',
      args: [SwapKind.GivenIn, swaps, assets, fundManagement, limits, deadline],
      account: walletAddress as Address,
    });

    const maxFeePerGas = feeHistory.baseFeePerGas[0] || 7500000000000n;
    const gasCostInEth = BigNumber.from(gas).mul(Number(maxFeePerGas).toFixed());
    const remainder = gasCostInEth.mod(10 ** 12);
    const gasCostInXRP = gasCostInEth.div(10 ** 12).add(remainder.gt(0) ? 1 : 0);
    const gasCostInXrpPriority = (gasCostInXRP.toBigInt() * 15n) / 10n;

    const formatted = Number(formatUnits(gasCostInXrpPriority, 6));
    return formatted;
  };

  useEffect(() => {
    getBlockTimestamp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txData]);

  const approveError = error?.message?.includes('Approved') || error?.message?.includes('BAL#401');

  const logs = txData?.logs?.filter(
    log => log.address.toLowerCase() === EVM_VAULT_ADDRESS[selectedNetwork].toLowerCase()
  );
  const firstLog = head(logs);
  const lastLog = last(logs);

  if (firstLog && lastLog && txData) {
    const firstTopics = decodeEventLog({
      abi: BALANCER_VAULT_ABI,
      data: firstLog.data,
      topics: firstLog.topics,
    });
    const lastTopics = decodeEventLog({
      abi: BALANCER_VAULT_ABI,
      data: lastLog.data,
      topics: lastLog.topics,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (txData as any).swapAmountFrom = (firstTopics.args as any).amountIn;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (txData as any).swapAmountTo = (lastTopics.args as any).amountOut;
  }

  return {
    isLoading: isPrepareLoading || isLoading || isWriteLoading,
    isSuccess,
    isError: (isError || isPrepareError) && !approveError,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    txData: txData as any,
    blockTimestamp,

    swap,
    estimateFee: async () => {
      // TODO: fee proxy
      if (currentNetwork === NETWORK.THE_ROOT_NETWORK) return getEstimatedGas();

      // TODO: handle evm sidechain
      return 0.0005;
    },
  };
};
