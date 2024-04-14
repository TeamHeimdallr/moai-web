import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import { Address, formatUnits, parseEther } from 'viem';
import {
  mainnet,
  sepolia,
  useContractWrite,
  usePrepareContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from 'wagmi';

import { IS_MAINNET } from '~/constants';

import { useSelectToken } from '~/pages/bridge/hooks/use-select-token';
import { getEthBridgeContractAddressFromTokneId } from '~/pages/bridge/utils/token';

import { useConnectedWallet } from '~/hooks/wallets';

import { ERC20_PEG_ROOT_TOKEN_ABI, ERC20_PEG_TOKEN_ABI } from '~/abi/erc20-peg';

interface Props {
  amount: bigint; // XRP amount, formatted 6 decimal
  destination: string; // XRP address
  tokenId: number;

  enabled?: boolean;
}

export const useBridgeEthToRoot = ({ amount, destination, tokenId, enabled }: Props) => {
  // ref: https://github.com/futureversecom/trn-app-hub/blob/main/libs/components/RootToXRP.jsx
  const publicClient = usePublicClient();

  const { evm } = useConnectedWallet();
  const { address: walletAddress } = evm;

  const [blockTimestamp, setBlockTimestamp] = useState<number>(0);

  const { token } = useSelectToken();
  const contractAddress = getEthBridgeContractAddressFromTokneId(tokenId);

  const {
    isLoading: prepareLoading,
    isError: prepareIsError,
    error: prepareError,
    config,
  } = usePrepareContractWrite({
    address: contractAddress as Address,
    abi: token?.symbol === 'ROOT' ? ERC20_PEG_ROOT_TOKEN_ABI : ERC20_PEG_TOKEN_ABI,
    functionName: 'deposit',

    account: walletAddress as Address,
    args: [token?.address, amount, destination],
    value: token?.symbol === 'ETH' ? amount + parseEther('0.0003') : parseEther('0.0003'),
    chainId: IS_MAINNET ? mainnet.id : sepolia.id,
    enabled: !!token.address && !!walletAddress && !!destination && amount > 0n && enabled,
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
    enabled: !!data?.hash,
  });

  const getBlockTimestamp = async () => {
    if (!txData || !enabled) return;

    const { timestamp } = await publicClient.getBlock({ blockNumber: txData.blockNumber });
    setBlockTimestamp(Number(timestamp) * 1000);
  };

  const writeAsync = async () => {
    await writeAsyncBase?.();
  };

  const getEstimatedGas = async () => {
    if (!walletAddress || !enabled) return;

    const feeHistory = await publicClient.getFeeHistory({
      blockCount: 2,
      rewardPercentiles: [25, 75],
    });

    const gas = await publicClient.estimateContractGas({
      address: contractAddress as Address,
      abi: token.symbol === 'ROOT' ? ERC20_PEG_ROOT_TOKEN_ABI : ERC20_PEG_TOKEN_ABI,
      functionName: 'deposit',

      account: walletAddress as Address,
      args: [token?.address || '', amount, destination],
      value: token?.symbol === 'ETH' ? amount + parseEther('0.0003') : parseEther('0.0003'),
    });

    const maxFeePerGas = feeHistory.baseFeePerGas[0] || 7500000000000n;
    const gasCostInEth = BigNumber.from(gas).mul(Number(maxFeePerGas).toFixed());
    const remainder = gasCostInEth.mod(10 ** 12);
    const gasCostInXRP = gasCostInEth.div(10 ** 12).add(remainder.gt(0) ? 1 : 0);
    const gasCostInXrpPriority = gasCostInXRP.toBigInt();

    const formatted = Number(formatUnits(gasCostInXrpPriority, 6));
    return formatted;
  };

  useEffect(() => {
    getBlockTimestamp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txData]);

  const prepareIsErrorWithoutAllowance =
    prepareIsError && !prepareError?.message?.includes('allowance');

  return {
    isPrepareLoading: prepareLoading,
    isLoading: isLoading || isWriteLoading,
    isSuccess,
    isError: isError || prepareIsErrorWithoutAllowance,

    error: error || prepareError,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    txData: txData as any,
    blockTimestamp,

    reset,
    writeAsync,
    estimateFee: getEstimatedGas,
  };
};
