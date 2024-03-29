import { useEffect, useState } from 'react';
import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { NetworkName } from '@therootnetwork/api';
import { BigNumber } from 'ethers';
import { Address, encodeFunctionData, formatUnits } from 'viem';
import { usePrepareContractWrite, usePublicClient, useWalletClient } from 'wagmi';

import { createExtrinsicPayload } from '~/api/api-contract/_evm/substrate/create-extrinsic-payload';
import { getTrnApi } from '~/api/api-contract/_evm/substrate/get-trn-api';
import {
  sendExtrinsicWithSignature,
  SubmittableResponse,
} from '~/api/api-contract/_evm/substrate/send-extrinsic-with-signature';
import { useSorQuery } from '~/api/api-server/sor/batch-swap';

import { EVM_VAULT_ADDRESS, IS_MAINNET } from '~/constants';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { useSwapNetworkFeeErrorStore } from '~/states/contexts/network-fee-error/network-fee-error';
import { NETWORK, SwapFundManagementInput, SwapKind } from '~/types';

import { BALANCER_VAULT_ABI } from '~/abi';

type Extrinsic = SubmittableExtrinsic<'promise', ISubmittableResult>;

interface Props {
  fromToken: Address;
  toToken: Address;
  swapAmount: bigint;

  fundManagement: SwapFundManagementInput;
  limit?: bigint[];
  deadline?: number;
  proxyEnabled?: boolean;
}
export const useBatchSwap = ({
  fromToken,
  toToken,
  swapAmount,
  fundManagement,
  limit = [BigInt(10)],
  deadline = 2000000000,
  proxyEnabled,
}: Props) => {
  const { setError } = useSwapNetworkFeeErrorStore();

  const { data: walletClient } = useWalletClient();

  const { fpass } = useConnectedWallet();
  const { address: walletAddress, signer } = fpass;

  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [txData, setTxData] = useState<SubmittableResponse>();

  const { selectedNetwork, isFpass } = useNetwork();

  const publicClient = usePublicClient();

  const { data } = useSorQuery(
    {
      queries: {
        network: NETWORK.THE_ROOT_NETWORK,
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

  const swapsRaw = data?.data.swaps ?? [];
  const swaps = swapsRaw.map(({ poolId, assetInIndex, assetOutIndex, amount, userData }) => [
    poolId,
    assetInIndex,
    assetOutIndex,
    amount,
    userData,
  ]);
  const assets = data?.data.tokenAddresses ?? [];
  const internalSwapLength = swaps.length - 1;
  const limits = [limit[0], ...Array.from({ length: internalSwapLength }).map(() => 0n), limit[1]];

  const [blockTimestamp, setBlockTimestamp] = useState<number>(0);

  const estimateFee = async () => {
    const feeHistory = await publicClient.getFeeHistory({
      blockCount: 2,
      rewardPercentiles: [25, 75],
    });

    if (!isFpass || !proxyEnabled) return;

    try {
      const [api] = await Promise.all([
        getTrnApi(IS_MAINNET ? ('root' as NetworkName) : ('porcini' as NetworkName)),
      ]);

      const encodedData =
        isFpass && !!walletAddress && !!signer
          ? encodeFunctionData({
              abi: BALANCER_VAULT_ABI,
              functionName: 'batchSwap',
              args: [SwapKind.GivenIn, swaps, assets, fundManagement, limits, deadline],
            })
          : '0x0';

      const gas = await publicClient.estimateContractGas({
        address: EVM_VAULT_ADDRESS[selectedNetwork] as Address,
        abi: BALANCER_VAULT_ABI,
        functionName: 'batchSwap',
        args: [SwapKind.GivenIn, swaps, assets, fundManagement, limits, deadline],
        account: walletAddress as Address,
      });

      const evmCall = api.tx.evm.call(
        walletAddress,
        EVM_VAULT_ADDRESS[selectedNetwork],
        encodedData,
        0,
        gas,
        feeHistory.baseFeePerGas[0],
        0,
        null,
        []
      );

      const extrinsic = api.tx.futurepass.proxyExtrinsic(walletAddress, evmCall) as Extrinsic;

      const info = await extrinsic.paymentInfo(signer);
      const fee = Number(formatUnits(info.partialFee.toBigInt(), 6));

      const maxFeePerGas = feeHistory.baseFeePerGas[0];
      const gasCostInEth = BigNumber.from(gas).mul(Number(maxFeePerGas).toFixed());
      const remainder = gasCostInEth.mod(10 ** 12);
      const gasCostInXRP = gasCostInEth.div(10 ** 12).add(remainder.gt(0) ? 1 : 0);
      const gasCostInXrpPriority = (gasCostInXRP.toBigInt() * 15n) / 10n;

      const evmFee = Number(formatUnits(gasCostInXrpPriority, 6));

      return fee + evmFee;
    } catch (err) {
      console.log('estimation fee error');
    }
  };

  const swap = async () => {
    const feeHistory = await publicClient.getFeeHistory({
      blockCount: 2,
      rewardPercentiles: [25, 75],
    });

    if (!isFpass || !proxyEnabled) return;

    try {
      setIsLoading(true);
      const [api] = await Promise.all([
        getTrnApi(IS_MAINNET ? ('root' as NetworkName) : ('porcini' as NetworkName)),
      ]);

      const encodedData =
        isFpass && !!walletAddress && !!signer
          ? encodeFunctionData({
              abi: BALANCER_VAULT_ABI,
              functionName: 'batchSwap',
              args: [SwapKind.GivenIn, swaps, assets, fundManagement, limits, deadline],
            })
          : '0x0';

      const gas = await publicClient.estimateContractGas({
        address: EVM_VAULT_ADDRESS[selectedNetwork] as Address,
        abi: BALANCER_VAULT_ABI,
        functionName: 'batchSwap',
        args: [SwapKind.GivenIn, swaps, assets, fundManagement, limits, deadline],
        account: walletAddress as Address,
      });

      const evmCall = api.tx.evm.call(
        walletAddress,
        EVM_VAULT_ADDRESS[selectedNetwork],
        encodedData,
        0,
        gas,
        feeHistory.baseFeePerGas[0],
        0,
        null,
        []
      );

      const extrinsic = api.tx.futurepass.proxyExtrinsic(walletAddress, evmCall) as Extrinsic;

      const [payload, ethPayload] = await createExtrinsicPayload(
        api as ApiPromise,
        signer ?? '',
        extrinsic.method
      );

      const signature = await walletClient?.request({
        method: 'personal_sign',
        params: [ethPayload, signer as Address],
      });

      const signedExtrinsic = extrinsic.addSignature(
        signer ?? '',
        signature as `0x${string}`,
        payload.toPayload()
      ) as Extrinsic;

      const result = await sendExtrinsicWithSignature(signedExtrinsic);

      setTxData(result);
      setIsLoading(false);
      setIsSuccess(result.isEvmSuccess ?? false);
      setIsError(!result.isEvmSuccess);

      return result.blockHash;
    } catch (err) {
      setIsLoading(false);
      setIsSuccess(false);
      setIsError(true);

      const error = err as { code?: number; message?: string };
      if (error.code) {
        console.log(error.code);
        if (error.code === 1010) setError(true);
      } else {
        console.log(error.message);
      }
    }
  };

  const getBlockTimestamp = async () => {
    if (!txData || !txData.blockNumber || !isFpass) return;

    const { timestamp } = await publicClient.getBlock({ blockNumber: txData.blockNumber });
    setBlockTimestamp(Number(timestamp) * 1000);
  };

  useEffect(() => {
    getBlockTimestamp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txData]);

  return {
    isLoading,
    isSuccess,
    isError,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    txData: txData as any,
    blockTimestamp,

    swap,
    estimateFee,
  };
};

export const useBatchSwapPrepare = ({
  fromToken,
  toToken,
  swapAmount,
  fundManagement,
  limit = [BigInt(10)],
  deadline = 2000000000,
  proxyEnabled,
}: Props) => {
  const { fpass } = useConnectedWallet();
  const { address: walletAddress } = fpass;

  const { selectedNetwork, isEvm, isFpass } = useNetwork();

  const { data } = useSorQuery(
    {
      queries: {
        network: NETWORK.THE_ROOT_NETWORK,
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

  const swapsRaw = data?.data.swaps ?? [];
  const swaps = swapsRaw.map(({ poolId, assetInIndex, assetOutIndex, amount, userData }) => [
    poolId,
    assetInIndex,
    assetOutIndex,
    amount,
    userData,
  ]);
  const assets = data?.data.tokenAddresses ?? [];
  const internalSwapLength = swaps.length - 1;
  const limits = [limit[0], ...Array.from({ length: internalSwapLength }).map(() => 0n), limit[1]];

  /* call prepare hook for check evm tx success */
  const {
    isFetching: isPrepareLoading,
    isError: isPrepareError,
    isSuccess: isPrepareSuccess,
    error,
  } = usePrepareContractWrite({
    address: EVM_VAULT_ADDRESS[selectedNetwork] as Address,
    abi: BALANCER_VAULT_ABI,
    functionName: 'batchSwap',
    account: walletAddress as Address,
    args: [SwapKind.GivenIn, swaps, assets, fundManagement, limits, deadline],
    enabled: proxyEnabled && isEvm && isFpass && !!walletAddress,
  });

  const approveError = error?.message?.includes('Approved') || error?.message?.includes('BAL#401');

  return {
    isPrepareError: isPrepareError && !approveError,
    isPrepareLoading,
    isPrepareSuccess,
    prepareError: error,
  };
};
