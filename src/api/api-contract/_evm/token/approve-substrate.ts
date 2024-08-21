import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { NetworkName } from '@therootnetwork/api';
import { BigNumber } from 'ethers';
import { Address, encodeFunctionData, formatUnits, parseEther, parseUnits } from 'viem';
import { useContractRead, usePublicClient } from 'wagmi';

import { createExtrinsicPayload } from '~/api/api-contract/_evm/substrate/create-extrinsic-payload';
import { getTrnApi } from '~/api/api-contract/_evm/substrate/get-trn-api';
import { sendExtrinsicWithSignature } from '~/api/api-contract/_evm/substrate/send-extrinsic-with-signature';

import { IS_MAINNET } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull, getTokenDecimal } from '~/utils';
import { useApproveNetworkFeeErrorStore } from '~/states/contexts/network-fee-error/network-fee-error';
import { useFeeTokenStore } from '~/states/data/fee-proxy';
import { NETWORK } from '~/types';

import { ERC20_TOKEN_ABI } from '~/abi';

import { estimateFeeProxy } from '../fee-proxy/estimate-fee-proxy';

type Extrinsic = SubmittableExtrinsic<'promise', ISubmittableResult>;

interface Props {
  amount?: bigint;
  allowanceMin?: bigint;
  spender?: Address;
  symbol?: string;
  tokenAddress?: Address;

  enabled?: boolean;
}
export const useApprove = ({
  amount: _amount,
  allowanceMin,
  spender,
  tokenAddress,

  enabled,
}: Props) => {
  const { setError } = useApproveNetworkFeeErrorStore();
  const { isNativeFee, feeToken } = useFeeTokenStore();

  const { network } = useParams();
  const { selectedNetwork, isFpass } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const { fpass } = useConnectedWallet();
  const [allowance, setAllowance] = useState(false);
  const { isConnected, address: walletAddress, signer } = fpass;

  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const internalEnabled = enabled && !!walletAddress && !!spender && isFpass && !!tokenAddress;
  const { isLoading: isReadLoading, refetch } = useContractRead({
    address: tokenAddress,
    abi: ERC20_TOKEN_ABI,
    functionName: 'allowance',
    chainId,
    args: [walletAddress, spender],
    enabled: internalEnabled,

    onSuccess: (data: string) => {
      return setAllowance(BigInt(data || 0) >= (allowanceMin || 0n));
    },
    onError: () => setAllowance(false),
  });

  const publicClient = usePublicClient();

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

      const encodedData = internalEnabled
        ? encodeFunctionData({
            abi: ERC20_TOKEN_ABI,
            functionName: 'approve',
            // args: [spender, amount],
            // TODO: approve max
            args: [spender, parseEther(Number.MAX_SAFE_INTEGER.toString())],
          })
        : '0x0';

      const gas = await publicClient.estimateContractGas({
        address: tokenAddress as Address,
        abi: ERC20_TOKEN_ABI,
        functionName: 'approve',
        account: walletAddress as Address,
        args: [spender, parseEther(Number.MAX_SAFE_INTEGER.toString())],
      });

      const maxFeePerGas = feeHistory.baseFeePerGas[0] || 7500000000000n;
      const gasCostInEth = BigNumber.from(gas).mul(Number(maxFeePerGas).toFixed());
      const remainder = gasCostInEth.mod(10 ** 12);
      const gasCostInXRP = gasCostInEth.div(10 ** 12).add(remainder.gt(0) ? 1 : 0);

      const evmCall = api.tx.evm.call(
        walletAddress,
        tokenAddress,
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

  const allowAsync = async () => {
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

      const encodedData = internalEnabled
        ? encodeFunctionData({
            abi: ERC20_TOKEN_ABI,
            functionName: 'approve',
            // args: [spender, amount],
            // TODO: approve max
            args: [spender, parseEther(Number.MAX_SAFE_INTEGER.toString())],
          })
        : '0x0';

      const gas = await publicClient.estimateContractGas({
        address: tokenAddress as Address,
        abi: ERC20_TOKEN_ABI,
        functionName: 'approve',
        account: walletAddress as Address,
        args: [spender, parseEther(Number.MAX_SAFE_INTEGER.toString())],
      });

      const maxFeePerGas = feeHistory.baseFeePerGas[0] || 7500000000000n;
      const gasCostInEth = BigNumber.from(gas).mul(Number(maxFeePerGas).toFixed());
      const remainder = gasCostInEth.mod(10 ** 12);
      const gasCostInXRP = gasCostInEth.div(10 ** 12).add(remainder.gt(0) ? 1 : 0);

      const evmCall = api.tx.evm.call(
        walletAddress,
        tokenAddress,
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

      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [ethPayload, signer],
      });

      const signedExtrinsic = extrinsic.addSignature(
        signer ?? '',
        signature as `0x${string}`,
        payload.toPayload()
      ) as Extrinsic;

      const result = await sendExtrinsicWithSignature(signedExtrinsic);

      setIsLoading(false);
      setIsSuccess(true);

      return result.blockHash;
    } catch (err) {
      setIsLoading(false);
      setIsSuccess(false);

      const error = err as { code?: number; message?: string };
      if (error.code) {
        console.log(error.code);
        if (error.code === 1010) {
          setError(true);
          return;
        }
      } else {
        console.log(error.message);
      }
    }
  };

  const allow = async () => {
    if (!isFpass) return;

    await allowAsync?.();
  };

  return {
    isLoading: isReadLoading || isLoading,
    isSuccess,
    allowance: isConnected && allowance,

    refetch,
    allow,
    estimateFee,
  };
};
