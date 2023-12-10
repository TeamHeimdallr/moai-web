import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { BigNumber } from 'ethers';
import { formatUnits } from 'viem';

import { ROOT_ASSET_ID } from '~/constants';

import { FeeToken } from '~/components/fee-proxy-selector';

import { getTokenDecimal } from '~/utils';
import { NETWORK } from '~/types';

type Extrinsic = SubmittableExtrinsic<'promise', ISubmittableResult>;

interface AmountsIn {
  Ok: [number, number];
}
interface Props {
  api: ApiPromise;
  extrinsic: Extrinsic;
  caller: string;
  feeToken: FeeToken;
  estimateGasCost: BigNumber;
  enabled: boolean;
}
export async function estimateFeeProxy({
  api,
  extrinsic,
  caller,
  feeToken,
  estimateGasCost,
  enabled,
}: Props): Promise<{ maxPayment: number | undefined }> {
  if (!enabled) return { maxPayment: undefined };

  try {
    const paymentInfo = await extrinsic.paymentInfo(caller);
    const estimatedFee = BigNumber.from(paymentInfo.partialFee.toString())
      .add(estimateGasCost)
      .toString();

    if (feeToken.assetId === ROOT_ASSET_ID.XRP) {
      return { maxPayment: Number(formatUnits(BigInt(estimatedFee), 6)) };
    }

    // query the the `dex` to determine the `maxPayment` you are willing to pay
    const {
      Ok: [amountIn],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } = (await (api.rpc as any).dex.getAmountsIn(estimatedFee, [
      feeToken.assetId,
      ROOT_ASSET_ID.XRP,
    ])) as unknown as AmountsIn;

    // allow a buffer to avoid slippage, 5%
    const maxPayment = Number(
      formatUnits(
        BigInt(Number(amountIn * 1.05).toFixed()),
        getTokenDecimal(NETWORK.THE_ROOT_NETWORK, feeToken.name)
      )
    );

    return { maxPayment: maxPayment };
  } catch (err) {
    console.log(err);
    console.log('estimation fee error');
  }
  return { maxPayment: undefined };
}
