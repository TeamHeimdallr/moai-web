import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { NetworkName } from '@therootnetwork/api';
import { Address, encodeFunctionData } from 'viem';
import { useContractRead, usePublicClient } from 'wagmi';

import { createExtrinsicPayload } from '~/api/api-contract/_evm/substrate/create-extrinsic-payload';
import { getTrnApi } from '~/api/api-contract/_evm/substrate/get-trn-api';
import { sendExtrinsicWithSignature } from '~/api/api-contract/_evm/substrate/send-extrinsic-with-signature';

import { IS_MAINNET } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';

import { ERC20_TOKEN_ABI } from '~/abi';

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
  amount,
  allowanceMin,
  spender,
  tokenAddress,

  enabled,
}: Props) => {
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
            args: [spender, amount],
          })
        : '0x0';

      const evmCall = api.tx.evm.call(
        walletAddress,
        tokenAddress,
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
  };
};
