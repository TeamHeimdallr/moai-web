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

import { CAMPAIGN_ADDRESS, IS_MAINNET } from '~/constants';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { useWithdrawLiquidityNetworkFeeErrorStore } from '~/states/contexts/network-fee-error/network-fee-error';
import { NETWORK } from '~/types';

import { CAMPAIGN_ABI } from '~/abi/campaign';

type Extrinsic = SubmittableExtrinsic<'promise', ISubmittableResult>;

interface Props {
  bptIn: bigint; // formatted 18 decimal
  enabled?: boolean;
}
export const useWithdrawLiquidity = ({ bptIn, enabled }: Props) => {
  const { setError } = useWithdrawLiquidityNetworkFeeErrorStore();

  const { data: walletClient } = useWalletClient();

  const { fpass } = useConnectedWallet();
  const { address: walletAddress, signer } = fpass;

  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [txData, setTxData] = useState<SubmittableResponse>();

  const { isFpass } = useNetwork();

  const publicClient = usePublicClient();

  const [blockTimestamp, setBlockTimestamp] = useState<number>(0);

  const reset = () => {
    setError(false);
    setIsSuccess(false);
    setIsLoading(false);
    setTxData(undefined);
  };
  const estimateFee = async () => {
    if (!isFpass) return;

    const feeHistory = await publicClient.getFeeHistory({
      blockCount: 2,
      rewardPercentiles: [25, 75],
    });

    try {
      const [api] = await Promise.all([
        getTrnApi(IS_MAINNET ? ('root' as NetworkName) : ('porcini' as NetworkName)),
      ]);

      const encodedData =
        isFpass && !!walletAddress && !!signer
          ? encodeFunctionData({
              abi: CAMPAIGN_ABI,
              functionName: 'withdraw',
              args: ['1'],
            })
          : '0x0';

      const evmCall = api.tx.evm.call(
        walletAddress,
        CAMPAIGN_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
        encodedData,
        0,
        '300000', // gas limit estimation todo: can be changed
        feeHistory.baseFeePerGas[0],
        0,
        null,
        []
      );

      const extrinsic = api.tx.futurepass.proxyExtrinsic(walletAddress, evmCall) as Extrinsic;

      const info = await extrinsic.paymentInfo(signer);
      const fee = Number(formatUnits(info.partialFee.toBigInt(), 6));

      const evmGas = await publicClient.estimateContractGas({
        address: CAMPAIGN_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
        abi: CAMPAIGN_ABI,
        functionName: 'withdraw',
        args: ['1'],
        account: walletAddress as Address,
      });

      const maxFeePerGas = feeHistory.baseFeePerGas[0];
      const gasCostInEth = BigNumber.from(evmGas).mul(Number(maxFeePerGas).toFixed());
      const remainder = gasCostInEth.mod(10 ** 12);
      const gasCostInXRP = gasCostInEth.div(10 ** 12).add(remainder.gt(0) ? 1 : 0);
      // const gasCostInXrpPriority = (gasCostInXRP.toBigInt() * 15n) / 10n;
      const gasCostInXrpPriority = gasCostInXRP.toBigInt();

      const evmFee = Number(formatUnits(gasCostInXrpPriority, 6));

      return fee + evmFee;
    } catch (err) {
      console.log('estimation fee error');
    }
  };

  const withdrawLiquidity = async () => {
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
              abi: CAMPAIGN_ABI,
              functionName: 'withdraw',
              args: [bptIn],
            })
          : '0x0';

      const evmCall = api.tx.evm.call(
        walletAddress,
        CAMPAIGN_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
        encodedData,
        0,
        '500000', // gas limit estimation todo: can be changed
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
    isPrepareLoading: false,
    isLoading,
    isSuccess,
    isError,

    error: null,
    reset,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    txData: txData as any,
    blockTimestamp,

    writeAsync: withdrawLiquidity,
    estimateFee,
  };
};

export const useWithdrawLiquidityPrepare = ({ bptIn, enabled }: Props) => {
  const { fpass } = useConnectedWallet();
  const { address: walletAddress } = fpass;

  const { isFpass } = useNetwork();

  /* call prepare hook for check evm tx success */
  const {
    isFetching: isPrepareLoading,
    isError: isPrepareError,
    isSuccess: isPrepareSuccess,
    error,
  } = usePrepareContractWrite({
    address: CAMPAIGN_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: CAMPAIGN_ABI,
    functionName: 'withdraw',

    account: walletAddress as Address,
    args: [bptIn],
    enabled: enabled && isFpass && !!walletAddress,
  });

  return {
    isPrepareError: isPrepareError,
    isPrepareLoading,
    isPrepareSuccess,
    prepareError: error,
  };
};
