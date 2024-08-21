import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ComposableStablePoolEncoder, WeightedPoolEncoder } from '@balancer-labs/sdk';
import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { NetworkName } from '@therootnetwork/api';
import { BigNumber } from 'ethers';
import { Address, encodeFunctionData, formatUnits, parseUnits } from 'viem';
import { usePrepareContractWrite, usePublicClient, useWalletClient } from 'wagmi';

import { createExtrinsicPayload } from '~/api/api-contract/_evm/substrate/create-extrinsic-payload';
import { getTrnApi } from '~/api/api-contract/_evm/substrate/get-trn-api';
import {
  sendExtrinsicWithSignature,
  SubmittableResponse,
} from '~/api/api-contract/_evm/substrate/send-extrinsic-with-signature';
import { useGetPoolVaultAmmQuery } from '~/api/api-server/pools/get-pool-vault-amm';

import { EVM_VAULT_ADDRESS, IS_MAINNET, STABLE_POOL_IDS } from '~/constants';
import { EVM_TOKEN_ADDRESS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr, getNetworkFull, getTokenDecimal } from '~/utils';
import { useWithdrawLiquidityNetworkFeeErrorStore } from '~/states/contexts/network-fee-error/network-fee-error';
import { useFeeTokenStore } from '~/states/data/fee-proxy';
import { ITokenComposition, NETWORK } from '~/types';

import { BALANCER_VAULT_ABI } from '~/abi';

import { estimateFeeProxy } from '../fee-proxy/estimate-fee-proxy';

type Extrinsic = SubmittableExtrinsic<'promise', ISubmittableResult>;

interface Props {
  poolId: string;
  tokens: (ITokenComposition & { amount: number })[];
  bptIn: bigint; // withdraw lp token amount. amounts out are calculated by exitExactBPTInForTokensOut function

  enabled?: boolean;
}
export const useWithdrawLiquidity = ({ poolId, tokens, bptIn, enabled }: Props) => {
  const { setError } = useWithdrawLiquidityNetworkFeeErrorStore();
  const { isNativeFee, feeToken } = useFeeTokenStore();

  const poolTokenAddress = poolId.slice(0, 42) as Address;
  const isStable = STABLE_POOL_IDS?.[NETWORK.THE_ROOT_NETWORK]?.includes(poolId);
  const tokensWithBpt = tokens.slice();
  if (isStable && tokensWithBpt.length <= 2) {
    const bptToken = {
      id: 9999,
      network: NETWORK.THE_ROOT_NETWORK,
      currency: '',
      isLpToken: true,
      isCexListed: false,
      address: poolTokenAddress,
      symbol: 'BPT',
      balance: 0,
      amount: 0,
    };
    tokensWithBpt.push(bptToken);
  }
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

  const sortedTokens = tokensWithBpt
    .slice()
    .sort((a, b) => handleNativeXrp(a.address).localeCompare(handleNativeXrp(b.address)));
  const sortedTokenAddressses = sortedTokens.map(t => t.address);

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
              functionName: 'exitPool',
              args: [
                poolId,
                walletAddress,
                walletAddress,
                [
                  sortedTokenAddressses,
                  tokensWithBpt.map(() => 0n),
                  isStable
                    ? ComposableStablePoolEncoder.exitExactBPTInForAllTokensOut(bptIn)
                    : WeightedPoolEncoder.exitExactBPTInForTokensOut(bptIn),
                  false,
                ],
              ],
            })
          : '0x0';

      const gas = await publicClient.estimateContractGas({
        address: EVM_VAULT_ADDRESS[selectedNetwork] as Address,
        abi: BALANCER_VAULT_ABI,
        functionName: 'exitPool',
        args: [
          poolId,
          walletAddress,
          walletAddress,
          [
            sortedTokenAddressses,
            tokensWithBpt.map(() => 0n),
            isStable
              ? ComposableStablePoolEncoder.exitExactBPTInForAllTokensOut(bptIn)
              : WeightedPoolEncoder.exitExactBPTInForTokensOut(bptIn),
            false,
          ],
        ],
        account: walletAddress as Address,
      });

      const maxFeePerGas = feeHistory.baseFeePerGas[0] || 7500000000000n;
      const gasCostInEth = BigNumber.from(gas).mul(Number(maxFeePerGas).toFixed());
      const remainder = gasCostInEth.mod(10 ** 12);
      const gasCostInXRP = gasCostInEth.div(10 ** 12).add(remainder.gt(0) ? 1 : 0);

      const evmCall = api.tx.evm.call(
        walletAddress,
        vault,
        encodedData,
        0,
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
      const gasCostInXrpPriority = (gasCostInXRP.toBigInt() * 11n) / 10n;
      const evmFee = Number(formatUnits(gasCostInXrpPriority, 6));

      return isNativeFee ? fee + evmFee : maxPayment;
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
        isFpass && !!walletAddress && !!signer && !!vault
          ? encodeFunctionData({
              abi: BALANCER_VAULT_ABI,
              functionName: 'exitPool',
              args: [
                poolId,
                walletAddress,
                walletAddress,
                [
                  sortedTokenAddressses,
                  tokensWithBpt.map(() => 0n),
                  isStable
                    ? ComposableStablePoolEncoder.exitExactBPTInForAllTokensOut(bptIn)
                    : WeightedPoolEncoder.exitExactBPTInForTokensOut(bptIn),
                  false,
                ],
              ],
            })
          : '0x0';

      const gas = await publicClient.estimateContractGas({
        address: EVM_VAULT_ADDRESS[selectedNetwork] as Address,
        abi: BALANCER_VAULT_ABI,
        functionName: 'exitPool',
        args: [
          poolId,
          walletAddress,
          walletAddress,
          [
            sortedTokenAddressses,
            tokensWithBpt.map(() => 0n),
            isStable
              ? ComposableStablePoolEncoder.exitExactBPTInForAllTokensOut(bptIn)
              : WeightedPoolEncoder.exitExactBPTInForTokensOut(bptIn),
            false,
          ],
        ],
        account: walletAddress as Address,
      });

      const maxFeePerGas = feeHistory.baseFeePerGas[0] || 7500000000000n;
      const gasCostInEth = BigNumber.from(gas).mul(Number(maxFeePerGas).toFixed());
      const remainder = gasCostInEth.mod(10 ** 12);
      const gasCostInXRP = gasCostInEth.div(10 ** 12).add(remainder.gt(0) ? 1 : 0);

      const evmCall = api.tx.evm.call(
        walletAddress,
        vault,
        encodedData,
        0,
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

    writeAsync: withdrawLiquidity,
    estimateFee,
  };
};

export const useWithdrawLiquidityPrepare = ({ poolId, tokens, bptIn, enabled }: Props) => {
  const { fpass } = useConnectedWallet();
  const { address: walletAddress } = fpass;
  const poolTokenAddress = poolId.slice(0, 42) as Address;
  const isStable = STABLE_POOL_IDS?.[NETWORK.THE_ROOT_NETWORK]?.includes(poolId);
  const tokensWithBpt = tokens.slice();
  if (isStable && tokensWithBpt.length <= 2) {
    const bptToken = {
      id: 9999,
      network: NETWORK.THE_ROOT_NETWORK,
      currency: '',
      isLpToken: true,
      isCexListed: false,
      address: poolTokenAddress,
      symbol: 'BPT',
      balance: 0,
      amount: 0,
    };
    tokensWithBpt.push(bptToken);
  }

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

  const sortedTokens = tokensWithBpt
    .slice()
    .sort((a, b) => handleNativeXrp(a.address).localeCompare(handleNativeXrp(b.address)));
  const sortedTokenAddressses = sortedTokens.map(t => t.address);

  const {
    isFetching: isPrepareLoading,
    isError: isPrepareError,
    isSuccess: isPrepareSuccess,
    error,
  } = usePrepareContractWrite({
    address: (vault || '') as Address,
    abi: BALANCER_VAULT_ABI,
    functionName: 'exitPool',

    account: walletAddress as Address,
    chainId,
    args: [
      poolId,
      walletAddress,
      walletAddress,
      [
        sortedTokenAddressses,
        tokensWithBpt.map(() => 0n),
        isStable
          ? ComposableStablePoolEncoder.exitExactBPTInForAllTokensOut(bptIn)
          : WeightedPoolEncoder.exitExactBPTInForTokensOut(bptIn),
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
