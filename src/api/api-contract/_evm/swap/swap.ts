import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BigNumber } from 'ethers';
import { decodeEventLog, formatUnits, zeroAddress } from 'viem';
import {
  Address,
  useContractWrite,
  usePrepareContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from 'wagmi';

import { useGetPoolVaultAmmQuery } from '~/api/api-server/pools/get-pool-vault-amm';

import { EVM_VAULT_ADDRESS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr, getNetworkFull } from '~/utils';
import { NETWORK, SwapFundManagementInput, SwapSingleSwapInput } from '~/types';

import { BALANCER_VAULT_ABI } from '~/abi';

interface Props {
  poolId: string;

  singleSwap: SwapSingleSwapInput;
  fundManagement: SwapFundManagementInput;
  limit?: bigint;
  deadline?: number;

  enabled?: boolean;
}
export const useSwap = ({
  poolId,

  singleSwap,
  fundManagement,
  limit = BigInt(10),
  deadline = 2000000000,
  enabled,
}: Props) => {
  const publicClient = usePublicClient();

  const { network } = useParams();
  const { evm } = useConnectedWallet();
  const { address: walletAddress } = evm;

  const { selectedNetwork, isEvm } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);

  const isRoot = currentNetwork === NETWORK.THE_ROOT_NETWORK;

  const chainId = useNetworkId(currentNetwork);
  const { data: poolVaultAmmData } = useGetPoolVaultAmmQuery(
    {
      params: {
        networkAbbr: currentNetworkAbbr as string,
        poolId: poolId as string,
      },
    },
    {
      enabled: !!poolId && !!currentNetworkAbbr,
      cacheTime: Infinity,
      staleTime: Infinity,
    }
  );
  const { poolVaultAmm } = poolVaultAmmData || {};
  const { vault } = poolVaultAmm || {};

  const [blockTimestamp, setBlockTimestamp] = useState<number>(0);

  const {
    isLoading: prepareLoading,
    config,
    isError: isPrepareError,
    error,
  } = usePrepareContractWrite({
    address: (vault || '') as Address,
    abi: BALANCER_VAULT_ABI,
    functionName: 'swap',
    chainId,
    value: singleSwap[2] === zeroAddress ? singleSwap[4] : 0n,
    args: [singleSwap, fundManagement, limit, deadline],
    enabled:
      enabled && !!vault && !!singleSwap && !!fundManagement && !!walletAddress && isEvm && !isRoot,
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
    await writeAsync?.();
  };

  const getEstimatedGas = async () => {
    if (!isEvm || isRoot) return;

    const feeHistory = await publicClient.getFeeHistory({
      blockCount: 2,
      rewardPercentiles: [25, 75],
    });

    const gas = await publicClient.estimateContractGas({
      address: EVM_VAULT_ADDRESS[selectedNetwork] as Address,
      abi: BALANCER_VAULT_ABI,
      functionName: 'swap',
      value: singleSwap[2] === zeroAddress ? singleSwap[4] : 0n,
      args: [singleSwap, fundManagement, limit, deadline],
      account: walletAddress as Address,
    });

    const maxFeePerGas = feeHistory.baseFeePerGas[0];
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

  useEffect(() => {
    getEstimatedGas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const approveError = error?.message?.includes('Approved') || error?.message?.includes('BAL#401');

  const log = txData?.logs?.find(
    ({ address }) => address.toLowerCase() === EVM_VAULT_ADDRESS[selectedNetwork].toLowerCase()
  );
  if (log && txData) {
    const topics = decodeEventLog({
      abi: BALANCER_VAULT_ABI,
      data: log.data,
      topics: log.topics,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (txData as any).swapAmountTo = (topics.args as any).amountOut;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (txData as any).swapAmountFrom = (topics.args as any).amountIn;
  }

  return {
    isLoading: prepareLoading || isLoading || isWriteLoading,
    isSuccess,
    isError: (isError || isPrepareError) && !approveError,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    txData: txData as any,
    blockTimestamp,

    swap,
    estimateFee: () => {
      // TODO: fee proxy
      if (currentNetwork === NETWORK.THE_ROOT_NETWORK) return getEstimatedGas();

      // TODO: handle evm sidechain
      return 0.0005;
    },
  };
};
