import { useEffect, useState } from 'react';
import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { NetworkName } from '@therootnetwork/api';
import { Address, formatUnits } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';

import { createExtrinsicPayload } from '~/api/api-contract/_evm/substrate/create-extrinsic-payload';
import { getTrnApi } from '~/api/api-contract/_evm/substrate/get-trn-api';
import {
  sendExtrinsicWithSignature,
  SubmittableResponse,
} from '~/api/api-contract/_evm/substrate/send-extrinsic-with-signature';

import { IS_MAINNET } from '~/constants';

import { useConnectedWallet } from '~/hooks/wallets';
import { useBridgeNetworkFeeErrorStore } from '~/states/contexts/network-fee-error/network-fee-error';
type Extrinsic = SubmittableExtrinsic<'promise', ISubmittableResult>;

interface Props {
  amount: bigint; // XRP amount, formatted 6 decimal
  destination: string; // XRP address
  tokenId: number; // https://explorer.rootnet.live/tokens

  enabled?: boolean;
}
export const useBridgeRootToEth = ({ amount, destination, tokenId, enabled }: Props) => {
  // ref: https://github.com/futureversecom/trn-app-hub/blob/main/libs/components/RootToETH.jsx
  const { setError } = useBridgeNetworkFeeErrorStore();

  const { data: walletClient } = useWalletClient();

  const { evm } = useConnectedWallet();
  const { address: walletAddress } = evm;
  const signer = walletAddress;

  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [txData, setTxData] = useState<SubmittableResponse>();

  const publicClient = usePublicClient();

  const [blockTimestamp, setBlockTimestamp] = useState<number>(0);

  const reset = () => {
    setError(false);
    setIsSuccess(false);
    setIsLoading(false);
    setTxData(undefined);
  };
  const estimateFee = async () => {
    try {
      const [api] = await Promise.all([
        getTrnApi(IS_MAINNET ? ('root' as NetworkName) : ('porcini' as NetworkName)),
      ]);

      const extrinsic = api.tx.erc20Peg.withdraw(
        tokenId,
        amount.toString(),
        destination
      ) as Extrinsic;

      const info = await extrinsic.paymentInfo(signer);
      const fee = Number(formatUnits(info.partialFee.toBigInt(), 6));

      return fee;
    } catch (err) {
      console.log('estimation fee error');
    }
  };

  const bridgeToEth = async () => {
    if (!enabled) return;

    try {
      setIsLoading(true);

      const [api] = await Promise.all([
        getTrnApi(IS_MAINNET ? ('root' as NetworkName) : ('porcini' as NetworkName)),
      ]);

      const extrinsic = api.tx.erc20Peg.withdraw(
        tokenId,
        amount.toString(),
        destination
      ) as Extrinsic;

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
    if (!txData || !txData.blockNumber) return;

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

    error: null,
    reset,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    txData: txData as any,
    blockTimestamp,

    writeAsync: bridgeToEth,
    estimateFee,
  };
};
