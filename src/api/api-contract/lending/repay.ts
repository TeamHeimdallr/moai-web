import { Address } from 'viem';

import { useNetwork } from '~/hooks/contexts/use-network';
import { IToken } from '~/types';

import { useRepay as useRepayEvm } from '../_evm/lending/repay';
import { useRepay as useRepayFpass } from '../_evm/lending/repay-substrate';

interface Props {
  token?: IToken & { amount: number; mTokenAddress: Address };
  isMax?: boolean;
  enabled?: boolean;
  debug?: 'idle' | 'loading' | 'success' | 'error';
}

// const useDummy = ({ debug }: Props) => {
//   if (debug === 'loading')
//     return {
//       isLoading: true,
//       isSuccess: false,
//       isError: false,
//       txData: undefined,
//       blockTimestamp: undefined,
//       writeAsync: async () => {
//         console.log('repay');
//       },
//       estimateFee: async () => 1.2394,
//     };
//   if (debug === 'error')
//     return {
//       isLoading: false,
//       isSuccess: false,
//       isError: true,
//       txData: {
//         extrinsicId: '0010915008-000001-e78b7',
//         transactionHash: '0x051f6f98a0496345310957bc2e9fae0b70342dec11dfd0892242e64208be28fd',
//       },
//       blockTimestamp: undefined,
//       writeAsync: async () => {
//         console.log('repay');
//       },
//       estimateFee: async () => 1.2394,
//     };
//   if (debug === 'success')
//     return {
//       isLoading: false,
//       isSuccess: true,
//       isError: false,
//       txData: {
//         extrinsicId: '0010915008-000001-e78b7',
//         transactionHash: '0x051f6f98a0496345310957bc2e9fae0b70342dec11dfd0892242e64208be28fd',
//       },
//       blockTimestamp: new Date().getTime(),
//       writeAsync: async () => {
//         console.log('repay');
//       },
//       estimateFee: async () => 1.2394,
//     };
//   return {
//     isLoading: false,
//     isSuccess: false,
//     isError: false,
//     txData: undefined,
//     blockTimestamp: undefined,
//     writeAsync: async () => {
//       console.log('repay');
//     },
//     estimateFee: async () => 1.2394,
//   };
// };

export const useLendingRepay = ({ token, isMax, enabled, debug: _debug }: Props) => {
  const { isFpass } = useNetwork();

  const resEvm = useRepayEvm({ token, isMax, enabled });
  const resFpass = useRepayFpass({ token, isMax, enabled });

  return isFpass ? resFpass : resEvm;
};
