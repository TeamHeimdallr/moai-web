import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { NetworkName } from '@therootnetwork/api';

import { createExtrinsicPayload } from '~/api/api-contract/_evm/substrate/create-extrinsic-payload';
import { getTrnApi } from '~/api/api-contract/_evm/substrate/get-trn-api';
import { sendExtrinsicWithSignature } from '~/api/api-contract/_evm/substrate/send-extrinsic-with-signature';

import { IS_MAINNET } from '~/constants';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';

type Extrinsic = SubmittableExtrinsic<'promise', ISubmittableResult>;

export const useCreateFuturepass = () => {
  const { evm } = useConnectedWallet();
  const address = evm.address ?? '';
  const { isFpass } = useNetwork();

  const createFuturepass = async () => {
    if (!isFpass) return;

    const [api] = await Promise.all([
      getTrnApi(IS_MAINNET ? ('root' as NetworkName) : ('porcini' as NetworkName)),
    ]);

    const extrinsic = api.tx.futurepass.create(address) as Extrinsic;

    const [payload, ethPayload] = await createExtrinsicPayload(
      api as ApiPromise,
      address ?? '',
      extrinsic.method
    );

    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [ethPayload, address],
    });

    const signedExtrinsic = extrinsic.addSignature(
      address ?? '',
      signature as `0x${string}`,
      payload.toPayload()
    ) as Extrinsic;

    const _result = await sendExtrinsicWithSignature(signedExtrinsic);
    // console.log(`Extrinsic Result: `, _result);
  };

  return {
    createFuturepass,
  };
};
