import { useEffect, useState } from 'react';
import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { NetworkName } from '@therootnetwork/api';
import { BigNumber } from 'ethers';
import { encodeFunctionData, formatUnits, parseUnits, zeroAddress } from 'viem';
import { Address, usePrepareContractWrite, usePublicClient, useWalletClient } from 'wagmi';

import { EVM_VAULT_ADDRESS, IS_MAINNET } from '~/constants';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getTokenDecimal } from '~/utils';
import { useSwapNetworkFeeErrorStore } from '~/states/contexts/network-fee-error/network-fee-error';
import { useFeeTokenStore } from '~/states/data/fee-proxy';
import { NETWORK, SwapFundManagementInput, SwapSingleSwapInput } from '~/types';

import { BALANCER_VAULT_ABI } from '~/abi';

import { estimateFeeProxy } from '../fee-proxy/estimate-fee-proxy';
import { createExtrinsicPayload } from '../substrate/create-extrinsic-payload';
import { getTrnApi } from '../substrate/get-trn-api';
import {
  sendExtrinsicWithSignature,
  SubmittableResponse,
} from '../substrate/send-extrinsic-with-signature';

type Extrinsic = SubmittableExtrinsic<'promise', ISubmittableResult>;

interface Props {
  poolId: string;

  singleSwap: SwapSingleSwapInput;
  fundManagement: SwapFundManagementInput;
  limit?: bigint;
  deadline?: number;

  enabled?: boolean;
}
export const useSwap = ({
  singleSwap,
  fundManagement,
  limit = BigInt(10),
  deadline = 2000000000,
  enabled,
}: Props) => {
  const { setError } = useSwapNetworkFeeErrorStore();
  const { isNativeFee, feeToken } = useFeeTokenStore();

  const { data: walletClient } = useWalletClient();

  const { fpass } = useConnectedWallet();
  const { address: walletAddress, signer } = fpass;

  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [txData, setTxData] = useState<SubmittableResponse>();

  const { selectedNetwork, isFpass } = useNetwork();

  const publicClient = usePublicClient();

  const [blockTimestamp, setBlockTimestamp] = useState<number>(0);

  const estimateFee = async () => {
    const feeHistory = await publicClient.getFeeHistory({
      blockCount: 2,
      rewardPercentiles: [25, 75],
    });

    if (!isFpass || !enabled) return;

    try {
      const [api] = await Promise.all([
        getTrnApi(IS_MAINNET ? ('root' as NetworkName) : ('porcini' as NetworkName)),
      ]);

      const encodedData =
        isFpass && !!walletAddress && !!signer
          ? encodeFunctionData({
              abi: BALANCER_VAULT_ABI,
              functionName: 'swap',
              args: [singleSwap, fundManagement, limit, deadline],
            })
          : '0x0';

      const gas = await publicClient.estimateContractGas({
        address: EVM_VAULT_ADDRESS[selectedNetwork] as Address,
        abi: BALANCER_VAULT_ABI,
        functionName: 'swap',
        value: singleSwap[2] === zeroAddress ? singleSwap[4] : 0n,
        args: [singleSwap, fundManagement, limit, deadline],
        account: walletAddress as Address,
      });

      const maxFeePerGas = feeHistory.baseFeePerGas[0] || 7500000000000n;
      const gasCostInEth = BigNumber.from(gas).mul(Number(maxFeePerGas).toFixed());
      const remainder = gasCostInEth.mod(10 ** 12);
      const gasCostInXRP = gasCostInEth.div(10 ** 12).add(remainder.gt(0) ? 1 : 0);

      const evmCall = api.tx.evm.call(
        walletAddress,
        EVM_VAULT_ADDRESS[selectedNetwork],
        encodedData,
        singleSwap[2] === zeroAddress ? singleSwap[4] : 0n,
        gas,
        feeHistory.baseFeePerGas[0] || 7500000000000n,
        0,
        null,
        []
      );

      const extrinsicRaw = api.tx.futurepass.proxyExtrinsic(walletAddress, evmCall) as Extrinsic;

      const { maxPayment } = await estimateFeeProxy({
        api,
        extrinsic: extrinsicRaw,
        caller: signer ?? '',
        feeToken,
        estimateGasCost: gasCostInXRP,
        enabled: isFpass && !!feeToken && !isNativeFee,
      });

      if (!isNativeFee && !maxPayment) {
        throw new Error('Insufficient Fee Proxy balance');
      }

      const feeProxyAmount = parseUnits(
        (maxPayment || 0)?.toFixed(),
        getTokenDecimal(NETWORK.THE_ROOT_NETWORK, feeToken.name)
      );

      const extrinsic = isNativeFee
        ? extrinsicRaw
        : api.tx.feeProxy.callWithFeePreferences(feeToken.assetId, feeProxyAmount, extrinsicRaw);

      const info = await extrinsic.paymentInfo(signer);
      const fee = Number(formatUnits(info.partialFee.toBigInt(), 6));
      const gasCostInXrpPriority = (gasCostInXRP.toBigInt() * 15n) / 10n;
      const evmFee = Number(formatUnits(gasCostInXrpPriority, 6));

      return isNativeFee ? fee + evmFee : maxPayment;
    } catch (err) {
      console.log('estimation fee error');
    }
  };

  const swap = async () => {
    const feeHistory = await publicClient.getFeeHistory({
      blockCount: 2,
      rewardPercentiles: [25, 75],
    });

    if (!isFpass || !enabled) return;

    try {
      setIsLoading(true);
      const [api] = await Promise.all([
        getTrnApi(IS_MAINNET ? ('root' as NetworkName) : ('porcini' as NetworkName)),
      ]);

      const encodedData =
        isFpass && !!walletAddress && !!signer
          ? encodeFunctionData({
              abi: BALANCER_VAULT_ABI,
              functionName: 'swap',
              args: [singleSwap, fundManagement, limit, deadline],
            })
          : '0x0';

      const gas = await publicClient.estimateContractGas({
        address: EVM_VAULT_ADDRESS[selectedNetwork] as Address,
        abi: BALANCER_VAULT_ABI,
        functionName: 'swap',
        value: singleSwap[2] === zeroAddress ? singleSwap[4] : 0n,
        args: [singleSwap, fundManagement, limit, deadline],
        account: walletAddress as Address,
      });

      const maxFeePerGas = feeHistory.baseFeePerGas[0] || 7500000000000n;
      const gasCostInEth = BigNumber.from(gas).mul(Number(maxFeePerGas).toFixed());
      const remainder = gasCostInEth.mod(10 ** 12);
      const gasCostInXRP = gasCostInEth.div(10 ** 12).add(remainder.gt(0) ? 1 : 0);

      const evmCall = api.tx.evm.call(
        walletAddress,
        EVM_VAULT_ADDRESS[selectedNetwork],
        encodedData,
        singleSwap[2] === zeroAddress ? singleSwap[4] : 0n,
        gas,
        feeHistory.baseFeePerGas[0] || 7500000000000n,
        0,
        null,
        []
      );

      const extrinsicRaw = api.tx.futurepass.proxyExtrinsic(walletAddress, evmCall) as Extrinsic;

      const { maxPayment } = await estimateFeeProxy({
        api,
        extrinsic: extrinsicRaw,
        caller: signer ?? '',
        feeToken,
        estimateGasCost: gasCostInXRP,
        enabled: isFpass && !!feeToken && !isNativeFee,
      });

      if (!isNativeFee && !maxPayment) {
        throw { code: 1010 };
      }

      const feeProxyAmount = parseUnits(
        (maxPayment || 0)?.toFixed(),
        getTokenDecimal(NETWORK.THE_ROOT_NETWORK, feeToken.name)
      );

      const extrinsic = isNativeFee
        ? extrinsicRaw
        : api.tx.feeProxy.callWithFeePreferences(feeToken.assetId, feeProxyAmount, extrinsicRaw);

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

export const useSwapPrepare = ({
  singleSwap,
  fundManagement,
  limit = BigInt(10),
  deadline = 2000000000,
  enabled,
}: Props) => {
  const { selectedNetwork, isEvm, isFpass } = useNetwork();

  const { evm, fpass } = useConnectedWallet();
  const walletAddress = isFpass ? fpass?.address : evm?.address;

  /* call prepare hook for check evm tx success */
  const {
    isFetching: isPrepareLoading,
    isError: isPrepareError,
    isSuccess: isPrepareSuccess,
    error,
  } = usePrepareContractWrite({
    address: EVM_VAULT_ADDRESS[selectedNetwork] as Address,
    abi: BALANCER_VAULT_ABI,
    functionName: 'swap',
    value: singleSwap[2] === zeroAddress ? singleSwap[4] : 0n,
    args: [singleSwap, fundManagement, limit, deadline],
    account: walletAddress as Address,
    enabled: enabled && isEvm && !!walletAddress && !!singleSwap && !!fundManagement,
  });

  const approveError =
    error?.message?.includes('Approved') ||
    error?.message?.includes('BAL#401') ||
    error?.message?.includes('allowance');

  return {
    isPrepareError: isPrepareError && !approveError,
    isPrepareLoading,
    isPrepareSuccess,
    prepareError: error,
  };
};
