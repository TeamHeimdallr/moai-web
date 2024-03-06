import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { WeightedPoolEncoder } from '@balancer-labs/sdk';
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
import { useGetPoolVaultAmmQuery } from '~/api/api-server/pools/get-pool-vault-amm';

import { EVM_VAULT_ADDRESS, IS_MAINNET } from '~/constants';
import { EVM_TOKEN_ADDRESS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr, getNetworkFull, isNativeToken } from '~/utils';
import { useAddLiquidityNetworkFeeErrorStore } from '~/states/contexts/network-fee-error/network-fee-error';
import { ITokenComposition, NETWORK } from '~/types';

import { BALANCER_VAULT_ABI } from '~/abi';

type Extrinsic = SubmittableExtrinsic<'promise', ISubmittableResult>;

interface Props {
  poolId: string;
  tokens: (ITokenComposition & { balance: number; amount: bigint })[];

  enabled?: boolean;
}
export const useAddLiquidity = ({ poolId, tokens, enabled }: Props) => {
  const { setError } = useAddLiquidityNetworkFeeErrorStore();

  const { data: walletClient } = useWalletClient();

  const { fpass } = useConnectedWallet();
  const { address: walletAddress, signer } = fpass;

  const { network } = useParams();

  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [txData, setTxData] = useState<SubmittableResponse>();

  const { selectedNetwork, isFpass } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);

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
  const publicClient = usePublicClient();

  const [blockTimestamp, setBlockTimestamp] = useState<number>(0);

  const handleNativeXrp = (token: string) => {
    if (currentNetwork !== NETWORK.EVM_SIDECHAIN) return token;

    if (token === EVM_TOKEN_ADDRESS?.[currentNetwork]?.ZERO)
      return EVM_TOKEN_ADDRESS?.[currentNetwork]?.XRP;
    return token;
  };

  const sortedTokens = tokens
    .slice()
    .sort((a, b) => handleNativeXrp(a.address).localeCompare(handleNativeXrp(b.address)));
  const sortedTokenAddressses = sortedTokens.map(t => t.address);
  const sortedAmountsIn = sortedTokens.map(t => t.amount);

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
        isFpass && !!walletAddress && !!signer && !!vault
          ? encodeFunctionData({
              abi: BALANCER_VAULT_ABI,
              functionName: 'joinPool',
              args: [
                poolId,
                walletAddress, // address sender, Address sending tokens to the pool
                walletAddress, // address recipient, Address receiving BPT (usually the same as sender)
                [
                  sortedTokenAddressses,
                  sortedAmountsIn, // max amount in
                  WeightedPoolEncoder.joinExactTokensInForBPTOut(sortedAmountsIn, '0'),
                  false,
                ],
              ],
            })
          : '0x0';

      const evmCall = api.tx.evm.call(
        walletAddress,
        vault,
        encodedData,
        0,
        '400000', // gas limit estimation todo: can be changed
        feeHistory.baseFeePerGas[0],
        0,
        null,
        []
      );

      const extrinsic = api.tx.futurepass.proxyExtrinsic(walletAddress, evmCall) as Extrinsic;

      const info = await extrinsic.paymentInfo(signer);
      const fee = Number(formatUnits(info.partialFee.toBigInt(), 6));

      const evmGas = await publicClient.estimateContractGas({
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
            WeightedPoolEncoder.joinExactTokensInForBPTOut(sortedAmountsIn, '0'),
            false,
          ],
        ],
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

  const addLiquidity = async () => {
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
        isFpass && !!walletAddress && !!signer && !!vault
          ? encodeFunctionData({
              abi: BALANCER_VAULT_ABI,
              functionName: 'joinPool',
              args: [
                poolId,
                walletAddress, // address sender, Address sending tokens to the pool
                walletAddress, // address recipient, Address receiving BPT (usually the same as sender)
                [
                  sortedTokenAddressses,
                  sortedAmountsIn, // max amount in
                  WeightedPoolEncoder.joinExactTokensInForBPTOut(sortedAmountsIn, '0'),
                  false,
                ],
              ],
            })
          : '0x0';

      const evmCall = api.tx.evm.call(
        walletAddress,
        vault,
        encodedData,
        0,
        '400000', // gas limit estimation todo: can be changed
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

    writeAsync: addLiquidity,
    estimateFee,
  };
};

export const useAddLiquidityPrepare = ({ poolId, tokens, enabled }: Props) => {
  const { fpass } = useConnectedWallet();
  const { address: walletAddress } = fpass;

  const { network } = useParams();

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

  const handleNativeXrp = (token: string) => {
    if (currentNetwork !== NETWORK.EVM_SIDECHAIN) return token;

    if (token === EVM_TOKEN_ADDRESS?.[currentNetwork]?.ZERO)
      return EVM_TOKEN_ADDRESS?.[currentNetwork]?.XRP;
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

  /* call prepare hook for check evm tx success */
  const {
    isFetching: isPrepareLoading,
    isError: isPrepareError,
    isSuccess: isPrepareSuccess,
    error,
  } = usePrepareContractWrite({
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
        WeightedPoolEncoder.joinExactTokensInForBPTOut(sortedAmountsIn, '0'),
        false,
      ],
    ],
    enabled: enabled && isEvm && isFpass && !!walletAddress && !!vault && !!poolId && !!chainId,
  });

  const approveError = error?.message?.includes('Approved');

  return {
    isPrepareError: isPrepareError && !approveError,
    isPrepareLoading,
    isPrepareSuccess,
    prepareError: error,
  };
};
