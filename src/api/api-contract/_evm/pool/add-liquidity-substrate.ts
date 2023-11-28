import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { WeightedPoolEncoder } from '@balancer-labs/sdk';
import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { NetworkName } from '@therootnetwork/api';
import { Address, encodeFunctionData } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';

import { createExtrinsicPayload } from '~/api/api-contract/_evm/substrate/create-extrinsic-payload';
import { getTrnApi } from '~/api/api-contract/_evm/substrate/get-trn-api';
import {
  sendExtrinsicWithSignature,
  SubmittableResponse,
} from '~/api/api-contract/_evm/substrate/send-extrinsic-with-signature';
import { useGetPoolVaultAmmQuery } from '~/api/api-server/pools/get-pool-vault-amm';

import { IS_MAINNET } from '~/constants';
import { EVM_TOKEN_ADDRESS } from '~/constants';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr, getNetworkFull } from '~/utils';
import { ITokenComposition, NETWORK } from '~/types';

import { BALANCER_VAULT_ABI } from '~/abi';

type Extrinsic = SubmittableExtrinsic<'promise', ISubmittableResult>;

interface Props {
  poolId: string;
  tokens: (ITokenComposition & { balance: number; amount: bigint })[];

  enabled?: boolean;
}
export const useAddLiquidity = ({ poolId, tokens, enabled }: Props) => {
  const { data: walletClient } = useWalletClient();

  const { fpass } = useConnectedWallet();
  const { address: walletAddress, signer } = fpass;

  const { network } = useParams();

  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    txData: txData as any,
    blockTimestamp,

    writeAsync: addLiquidity,
  };
};
