import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ComposableStablePoolEncoder, WeightedPoolEncoder } from '@balancer-labs/sdk';
import { BigNumber } from 'ethers';
import { formatUnits } from 'viem';
import {
  Address,
  useContractWrite,
  usePrepareContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from 'wagmi';

import { useGetPoolVaultAmmQuery } from '~/api/api-server/pools/get-pool-vault-amm';

import { EVM_VAULT_ADDRESS, STABLE_POOL_IDS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr, getNetworkFull, getWrappedTokenAddress, isNativeToken } from '~/utils';
import { ITokenComposition, NETWORK } from '~/types';

import { BALANCER_VAULT_ABI } from '~/abi';

interface Props {
  poolId: string;
  tokens: (ITokenComposition & { balance: number; amount: bigint })[];

  enabled?: boolean;
}
export const useAddLiquidity = ({ poolId, tokens, enabled }: Props) => {
  const publicClient = usePublicClient();

  const poolTokenAddress = poolId.slice(0, 42) as Address;
  const isStable = STABLE_POOL_IDS[NETWORK.THE_ROOT_NETWORK].includes(poolId);
  const tokensWithoutBpt = tokens.map(t => t);
  if (isStable && tokens.length <= 2) {
    const bptToken = {
      id: 9999,
      network: NETWORK.THE_ROOT_NETWORK,
      currency: '',
      isLpToken: true,
      isCexListed: false,
      address: poolTokenAddress,
      symbol: 'BPT',
      balance: 0,
      amount: 0n,
    };
    tokens.push(bptToken);
  }

  const { network } = useParams();
  const { evm } = useConnectedWallet();
  const { isConnected, address: walletAddress } = evm;

  const { selectedNetwork, isEvm, isFpass } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);

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

  const handleNativeXrp = (token: string) => {
    if (currentNetwork !== NETWORK.EVM_SIDECHAIN) return token;

    if (isNativeToken({ address: token as Address, network: currentNetwork }))
      return getWrappedTokenAddress(currentNetwork) ?? token;
    return token;
  };

  const sortedTokens = tokens
    .slice()
    .sort((a, b) => handleNativeXrp(a.address).localeCompare(handleNativeXrp(b.address)));
  const sortedTokenAddressses = sortedTokens.map(t => t.address);
  const sortedAmountsIn = sortedTokens.map(t => t.amount);
  const nativeTokenIndex = sortedTokens.findIndex(t =>
    isNativeToken({
      address: t.address as Address,
      symbol: t.symbol,
      network: currentNetwork,
    })
  );

  const sortedTokensWithoutBpt = tokensWithoutBpt
    .slice()
    .sort((a, b) => handleNativeXrp(a.address).localeCompare(handleNativeXrp(b.address)));
  const sortedAmountsInWithoutBpt = sortedTokensWithoutBpt.map(t => t.amount);

  const { isLoading: prepareLoading, config } = usePrepareContractWrite({
    address: (vault || '') as Address,
    abi: BALANCER_VAULT_ABI,
    functionName: 'joinPool',

    account: walletAddress as Address,
    chainId,
    value: nativeTokenIndex === -1 ? 0n : sortedTokens[nativeTokenIndex].amount,
    args: [
      poolId,
      walletAddress,
      walletAddress,
      [
        sortedTokenAddressses,
        sortedAmountsIn,
        isStable
          ? ComposableStablePoolEncoder.joinExactTokensInForBPTOut(sortedAmountsInWithoutBpt, '0')
          : WeightedPoolEncoder.joinExactTokensInForBPTOut(sortedAmountsIn, '0'),
        false,
      ],
    ],
    enabled: enabled && isConnected && isEvm && !isFpass && !!walletAddress && !!vault,
  });

  const { data, isLoading: isWriteLoading, writeAsync: writeAsyncBase } = useContractWrite(config);

  const {
    isLoading,
    isSuccess,
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
      address: EVM_VAULT_ADDRESS[selectedNetwork] as Address,
      abi: BALANCER_VAULT_ABI,
      functionName: 'joinPool',
      args: [
        poolId,
        walletAddress,
        walletAddress,
        [
          sortedTokenAddressses,
          sortedAmountsIn,
          isStable
            ? ComposableStablePoolEncoder.joinExactTokensInForBPTOut(sortedAmountsInWithoutBpt, '0')
            : WeightedPoolEncoder.joinExactTokensInForBPTOut(sortedAmountsIn, '0'),
          false,
        ],
      ],
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

  return {
    isLoading: prepareLoading || isLoading || isWriteLoading,
    isSuccess,

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
