import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BigNumber } from 'ethers';
import { Abi, formatUnits } from 'viem';
import {
  Address,
  useContractWrite,
  usePrepareContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from 'wagmi';

import { UNITROLLER_ADDRESS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';

import { COMPTROLLER_ABI } from '~/abi/comptroller';

interface Props {
  marketAddress: Address;
  currentStatus: 'enable' | 'disable';
  enabled?: boolean;
}
export const useEnterOrExitMarket = ({ marketAddress, currentStatus, enabled }: Props) => {
  const publicClient = usePublicClient();
  const isEnterRequest = currentStatus === 'disable';

  const { network } = useParams();
  const { evm } = useConnectedWallet();
  const { isConnected, address: walletAddress } = evm;

  const { selectedNetwork, isEvm, isFpass } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const chainId = useNetworkId(currentNetwork);

  const [blockTimestamp, setBlockTimestamp] = useState<number>(0);

  const { isLoading: prepareLoading, config } = usePrepareContractWrite({
    address: UNITROLLER_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: COMPTROLLER_ABI as Abi,
    functionName: isEnterRequest ? 'enterMarkets' : 'exitMarket',

    account: walletAddress as Address,
    chainId,
    args: isEnterRequest ? [[marketAddress]] : [marketAddress],
    enabled: enabled && isConnected && isEvm && !isFpass && !!walletAddress && !!marketAddress,
  });

  const {
    data,
    isLoading: isWriteLoading,
    writeAsync: writeAsyncBase,
    isError: isWriteError,
  } = useContractWrite(config);

  const {
    isLoading,
    isSuccess,
    data: txData,
    isError: isWaitError,
  } = useWaitForTransaction({
    hash: data?.hash,
    enabled: !!data?.hash && isEvm,
  });

  const getBlockTimestamp = async () => {
    if (!txData || !txData.blockNumber || !isEvm) return;

    const { timestamp } = await publicClient.getBlock({ blockNumber: txData.blockNumber });
    setBlockTimestamp(Number(timestamp) * 1000);
  };

  const writeAsync = async () => {
    await writeAsyncBase?.();
  };

  const getEstimatedGas = async () => {
    if (!isEvm || isFpass) return;

    const feeHistory = await publicClient.getFeeHistory({
      blockCount: 2,
      rewardPercentiles: [25, 75],
    });

    const gas = await publicClient.estimateContractGas({
      address: UNITROLLER_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
      abi: COMPTROLLER_ABI as Abi,
      functionName: isEnterRequest ? 'enterMarkets' : 'exitMarket',

      account: walletAddress as Address,
      args: isEnterRequest ? [[marketAddress]] : [marketAddress],
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

  return {
    isLoading: prepareLoading || isLoading || isWriteLoading,
    isSuccess,
    isError: isWriteError || isWaitError,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    txData: txData as any,
    blockTimestamp,

    writeAsync,
    estimateFee: async () => {
      // TODO: fee proxy
      if (currentNetwork === NETWORK.THE_ROOT_NETWORK) return getEstimatedGas();

      // TODO: handle evm sidechain
      return 0.0005;
    },
  };
};
