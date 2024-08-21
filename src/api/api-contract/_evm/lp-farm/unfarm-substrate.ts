import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

import { IS_MAINNET, LP_FARM_ADDRESS_WITH_POOL_ID } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { useUnfarmNetworkFeeErrorStore } from '~/states/contexts/network-fee-error/network-fee-error';

import { LP_FARM_ABI } from '~/abi/lp-farm';

type Extrinsic = SubmittableExtrinsic<'promise', ISubmittableResult>;

interface Props {
  poolId: string;
  unfarmAmount: bigint;
  enabled?: boolean;
}
export const useUnfarmSubstrate = ({ poolId, unfarmAmount, enabled }: Props) => {
  const { setError } = useUnfarmNetworkFeeErrorStore();

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

      const farmAddress = LP_FARM_ADDRESS_WITH_POOL_ID['THE_ROOT_NETWORK'][poolId] as Address;
      const encodedData =
        isFpass && !!walletAddress && !!signer && !!poolId && !!unfarmAmount
          ? encodeFunctionData({
              abi: LP_FARM_ABI,
              functionName: 'withdraw',
              args: [0, unfarmAmount],
            })
          : '0x0';

      const gas = await publicClient.estimateContractGas({
        address: (farmAddress || '') as Address,
        abi: LP_FARM_ABI,
        functionName: 'withdraw',

        account: walletAddress as Address,
        args: [0, unfarmAmount],
      });

      const evmCall = api.tx.evm.call(
        walletAddress,
        farmAddress,
        encodedData,
        0,
        gas,
        feeHistory.baseFeePerGas[0] || 7500000000000n,
        0,
        null,
        []
      );

      const extrinsic = api.tx.futurepass.proxyExtrinsic(walletAddress, evmCall) as Extrinsic;

      const info = await extrinsic.paymentInfo(signer);
      const fee = Number(formatUnits(info.partialFee.toBigInt(), 6));

      const maxFeePerGas = feeHistory.baseFeePerGas[0] || 7500000000000n;
      const gasCostInEth = BigNumber.from(gas).mul(Number(maxFeePerGas).toFixed());
      const remainder = gasCostInEth.mod(10 ** 12);
      const gasCostInXRP = gasCostInEth.div(10 ** 12).add(remainder.gt(0) ? 1 : 0);
      const gasCostInXrpPriority = (gasCostInXRP.toBigInt() * 11n) / 10n;

      const evmFee = Number(formatUnits(gasCostInXrpPriority, 6));

      return fee + evmFee;
    } catch (err) {
      console.log('estimation fee error');
    }
  };

  const unfarm = async () => {
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

      const farmAddress = LP_FARM_ADDRESS_WITH_POOL_ID['THE_ROOT_NETWORK'][poolId] as Address;
      const encodedData =
        isFpass && !!walletAddress && !!signer && !!poolId && !!unfarmAmount
          ? encodeFunctionData({
              abi: LP_FARM_ABI,
              functionName: 'withdraw',
              args: [0, unfarmAmount],
            })
          : '0x0';

      const gas = await publicClient.estimateContractGas({
        address: (farmAddress || '') as Address,
        abi: LP_FARM_ABI,
        functionName: 'withdraw',
        account: walletAddress as Address,
        args: [0, unfarmAmount],
      });

      const evmCall = api.tx.evm.call(
        walletAddress,
        farmAddress,
        encodedData,
        0,
        gas,
        feeHistory.baseFeePerGas[0] || 7500000000000n,
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

    writeAsync: unfarm,
    estimateFee,
  };
};

export const useUnfarmPrepare = ({ poolId, unfarmAmount, enabled }: Props) => {
  const { fpass } = useConnectedWallet();
  const { address: walletAddress } = fpass;

  const { network } = useParams();

  const { selectedNetwork, isEvm, isFpass } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);
  const farmAddress = LP_FARM_ADDRESS_WITH_POOL_ID['THE_ROOT_NETWORK'][poolId] as Address;

  const {
    isFetching: isPrepareLoading,
    isError: isPrepareError,
    isSuccess: isPrepareSuccess,
    error,
  } = usePrepareContractWrite({
    address: (farmAddress || '') as Address,
    abi: LP_FARM_ABI,
    functionName: 'withdraw',
    account: walletAddress as Address,
    args: [0, unfarmAmount],
    chainId,
    enabled:
      enabled && isEvm && isFpass && !!walletAddress && !!unfarmAmount && !!poolId && !!chainId,
  });

  return {
    isPrepareError: isPrepareError,
    isPrepareLoading,
    isPrepareSuccess,
    prepareError: error,
  };
};
