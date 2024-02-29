import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BigNumber } from 'ethers';
import { Abi, formatUnits, parseUnits } from 'viem';
import {
  Address,
  useContractWrite,
  usePrepareContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from 'wagmi';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { IToken, NETWORK } from '~/types';

import { MTOKEN_ABI } from '~/abi/mtoken';

interface Props {
  token?: IToken & { amount: number; mTokenAddress: Address };
  isMax?: boolean;
  enabled?: boolean;
}
export const useRepay = ({ token, enabled, isMax }: Props) => {
  const publicClient = usePublicClient();

  const { network } = useParams();
  const { evm } = useConnectedWallet();
  const { isConnected, address: walletAddress } = evm;

  const { selectedNetwork, isEvm, isFpass } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const chainId = useNetworkId(currentNetwork);

  const [blockTimestamp, setBlockTimestamp] = useState<number>(0);

  const inputAmount = parseUnits(`${(token?.amount || 0).toFixed(18)}`, token?.decimal || 18);
  const uint256Max =
    '115792089237316195423570985008687907853269984665640564039457584007913129639935'; // -1

  const { isLoading: prepareLoading, config } = usePrepareContractWrite({
    address: (token?.mTokenAddress || '0x0') as Address,
    abi: MTOKEN_ABI as Abi,
    functionName: 'repayBorrow',

    account: walletAddress as Address,
    chainId,
    args: [isMax ? uint256Max : inputAmount],
    enabled:
      enabled &&
      isConnected &&
      isEvm &&
      !isFpass &&
      !!walletAddress &&
      !!token &&
      token?.amount > 0,
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
      address: (token?.mTokenAddress || '') as Address,
      abi: MTOKEN_ABI as Abi,

      functionName: 'repayBorrow',
      args: [inputAmount],
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
