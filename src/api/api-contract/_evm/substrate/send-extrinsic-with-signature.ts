/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SubmittableExtrinsic, SubmittableResultValue } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';

import { EVM_VAULT_ADDRESS } from '~/constants';

import { NETWORK } from '~/types';

import { filterExtrinsicEvents } from './filter-extrinsic-events';

export interface SubmittableResponse {
  blockHash: string;
  blockNumber: bigint;

  extrinsicHash: string;
  extrinsicIndex: number;
  extrinsicId: string;
  swapAmountFrom?: bigint;
  swapAmountTo?: bigint;

  transactionHash: string; // for compatiable with TransactionReceipt
}
export async function sendExtrinsicWithSignature(
  extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>
): Promise<SubmittableResponse> {
  return new Promise((resolve, reject) => {
    let unsubscribe: () => void;
    extrinsic
      .send(result => {
        const { status, dispatchError, txHash, txIndex, blockNumber, events } =
          result as SubmittableResultValue;
        if (!status.isFinalized) return;

        if (!dispatchError) {
          unsubscribe?.();
          const blockHash = status.asFinalized.toString();
          const height = blockNumber!.toString().padStart(10, '0');
          const index = txIndex!.toString().padStart(6, '0');
          const hash = blockHash.slice(2, 7);
          const extrinsicId = `${height}-${index}-${hash}`;

          // Note: VAULT's to = User's from and VAULT's from = User's to
          const [rootFromEvent, rootToEvent, assetFromEvent, assetToEvent] = filterExtrinsicEvents(
            events,
            [
              {
                name: 'Balances.Transfer',
                key: 'to',
                data: { value: EVM_VAULT_ADDRESS[NETWORK.THE_ROOT_NETWORK], type: 'T::AccountId' },
              },
              {
                name: 'Balances.Transfer',
                key: 'from',
                data: { value: EVM_VAULT_ADDRESS[NETWORK.THE_ROOT_NETWORK], type: 'T::AccountId' },
              },
              {
                name: 'Assets.Transferred',
                key: 'to',
                data: { value: EVM_VAULT_ADDRESS[NETWORK.THE_ROOT_NETWORK], type: 'T::AccountId' },
              },
              {
                name: 'Assets.Transferred',
                key: 'from',
                data: { value: EVM_VAULT_ADDRESS[NETWORK.THE_ROOT_NETWORK], type: 'T::AccountId' },
              },
            ]
          );

          const fromAmount = rootFromEvent
            ? BigInt(rootFromEvent.event?.data[2].toString())
            : assetFromEvent
            ? BigInt(assetFromEvent.event?.data[3].toString())
            : 0n;

          const toAmount = rootToEvent
            ? BigInt(rootToEvent.event?.data[2].toString())
            : assetToEvent
            ? BigInt(assetToEvent.event?.data[3].toString())
            : 0n;

          return resolve({
            blockHash,
            extrinsicHash: txHash.toString(),
            extrinsicIndex: txIndex!,
            extrinsicId,
            blockNumber: BigInt(Number(blockNumber)),
            transactionHash: txHash.toString(),
            swapAmountFrom: fromAmount,
            swapAmountTo: toAmount,
          });
        }

        if (!dispatchError.isModule) {
          unsubscribe?.();
          return reject(new Error(`Extrinsic failed ${JSON.stringify(dispatchError.toJSON())}`));
        }

        const { section, name, docs } = dispatchError.registry.findMetaError(
          dispatchError.asModule
        );
        unsubscribe?.();
        reject(new Error(`Extrinsic sending failed, [${section}.${name}] ${docs}`));
      })
      .then(unsub => (unsubscribe = unsub))
      .catch(error => reject(error));
  });
}
