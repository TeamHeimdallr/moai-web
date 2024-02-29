import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { NetworkName } from '@therootnetwork/api';
import { BigNumber } from 'ethers';
import { encodeFunctionData, formatUnits, parseUnits } from 'viem';
import { Address, usePrepareContractWrite, usePublicClient, useWalletClient } from 'wagmi';

import { IS_MAINNET } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { useLendingWithdrawNetworkFeeErrorStore } from '~/states/contexts/network-fee-error/network-fee-error';
import { IToken } from '~/types';

import { MTOKEN_ABI } from '~/abi/mtoken';

import { createExtrinsicPayload } from '../substrate/create-extrinsic-payload';
import { getTrnApi } from '../substrate/get-trn-api';
import {
  sendExtrinsicWithSignature,
  SubmittableResponse,
} from '../substrate/send-extrinsic-with-signature';

type Extrinsic = SubmittableExtrinsic<'promise', ISubmittableResult>;

interface Props {
  token?: IToken & { amount: number; mTokenAddress: Address };
  enabled?: boolean;
}
export const useRedeemUnderlying = ({ token, enabled }: Props) => {
  const { setError } = useLendingWithdrawNetworkFeeErrorStore();

  const publicClient = usePublicClient();

  const { data: walletClient } = useWalletClient();
  const { fpass } = useConnectedWallet();
  const { address: walletAddress, signer } = fpass;

  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [txData, setTxData] = useState<SubmittableResponse>();

  const { isEvm, isFpass } = useNetwork();

  const [blockTimestamp, setBlockTimestamp] = useState<number>(0);

  const inputAmount = parseUnits(`${(token?.amount || 0).toFixed(18)}`, token?.decimal || 18);

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
        isFpass && !!walletAddress && !!signer && !!token
          ? encodeFunctionData({
              abi: MTOKEN_ABI,
              functionName: 'redeemUnderlying',
              args: [inputAmount],
            })
          : '0x0';

      const evmCall = api.tx.evm.call(
        walletAddress,
        (token?.mTokenAddress || '') as Address,
        encodedData,
        0,
        '300000', // gas limit estimation todo: can be changed, actual: around 26k
        feeHistory.baseFeePerGas[0],
        0,
        null,
        []
      );

      const extrinsic = api.tx.futurepass.proxyExtrinsic(walletAddress, evmCall) as Extrinsic;

      const info = await extrinsic.paymentInfo(signer);
      const fee = Number(formatUnits(info.partialFee.toBigInt(), 6));

      const evmGas = await publicClient.estimateContractGas({
        address: (token?.mTokenAddress || '') as Address,
        abi: MTOKEN_ABI,
        functionName: 'redeemUnderlying',
        args: [inputAmount],
        account: walletAddress as Address,
      });

      const maxFeePerGas = feeHistory.baseFeePerGas[0];
      const gasCostInEth = BigNumber.from(evmGas).mul(Number(maxFeePerGas).toFixed());
      const remainder = gasCostInEth.mod(10 ** 12);
      const gasCostInXRP = gasCostInEth.div(10 ** 12).add(remainder.gt(0) ? 1 : 0);
      const gasCostInXrpPriority = (gasCostInXRP.toBigInt() * 15n) / 10n;

      const evmFee = Number(formatUnits(gasCostInXrpPriority, 6));

      return fee + evmFee;
    } catch (err) {
      console.log('estimation fee error');
    }
  };

  const redeemUnderlying = async () => {
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
        isFpass && !!walletAddress && !!signer && !!token
          ? encodeFunctionData({
              abi: MTOKEN_ABI,
              functionName: 'redeemUnderlying',
              args: [inputAmount],
            })
          : '0x0';

      const evmCall = api.tx.evm.call(
        walletAddress,
        (token?.mTokenAddress || '') as Address,
        encodedData,
        0,
        '300000', // gas limit estimation todo: can be changed
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
    if (!txData || !txData.blockNumber || !isEvm) return;

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

    writeAsync: redeemUnderlying,
    estimateFee,
  };
};

export const useRedeemUnderlyingPrepare = ({ token, enabled }: Props) => {
  const { fpass } = useConnectedWallet();
  const { address: walletAddress } = fpass;

  const { network } = useParams();

  const { selectedNetwork, isEvm, isFpass } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const inputAmount = parseUnits(`${(token?.amount || 0).toFixed(18)}`, token?.decimal || 18);

  /* call prepare hook for check evm tx success */
  const {
    isFetching: isPrepareLoading,
    isError: isPrepareError,
    isSuccess: isPrepareSuccess,
    error,
  } = usePrepareContractWrite({
    address: (token?.mTokenAddress || '') as Address,
    abi: MTOKEN_ABI,
    functionName: 'redeemUnderlying',

    account: walletAddress as Address,
    chainId,
    args: [inputAmount],

    enabled: enabled && isEvm && isFpass && !!walletAddress && !!token && token?.amount > 0,
  });

  return {
    isPrepareError,
    isPrepareLoading,
    isPrepareSuccess,
    prepareError: error,
  };
};
