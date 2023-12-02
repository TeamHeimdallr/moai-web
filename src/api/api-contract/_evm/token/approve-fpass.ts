// import { useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { Address, encodeFunctionData, parseUnits } from 'viem';
// import {
//   useContractRead,
//   useContractWrite,
//   usePrepareContractWrite,
//   useWaitForTransaction,
// } from 'wagmi';

// import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
// import { useConnectedWallet } from '~/hooks/wallets';
// import { getNetworkFull } from '~/utils';

// import { ERC20_TOKEN_ABI } from '~/abi';
// import { FUTUREPASS_ABI } from '~/abi/futurepass';

// interface Props {
//   amount?: number;
//   allowanceMin?: number;
//   spender?: Address;
//   tokenAddress?: Address;
//   symbol?: string

//   enabled?: boolean;
// }
// export const useApprove = ({
//   amount,
//   allowanceMin,
//   spender,
//   tokenAddress,
//   symbol,

//   enabled,
// }: Props) => {
//   const { network } = useParams();
//   const { selectedNetwork, isEvm, isFpass } = useNetwork();

//   const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
//   const chainId = useNetworkId(currentNetwork);

//   const [allowance, setAllowance] = useState(false);

//   const { fpass } = useConnectedWallet();
//   const { isConnected, address: walletAddress, signer } = fpass;

//   const internalEnabled =
//     enabled && !!walletAddress && !!spender && isEvm && isFpass && !!tokenAddress;

//   const { isLoading: isReadLoading, refetch } = useContractRead({
//     address: tokenAddress,
//     abi: ERC20_TOKEN_ABI,
//     functionName: 'allowance',
//     chainId,
//     args: [walletAddress, spender],
//     enabled: internalEnabled,

//     onSuccess: (data: string) => {
//       return setAllowance(
//         BigInt(data || 0) >=
//           parseUnits((allowanceMin || 0)?.toString(),  getTokenDecimal(currentNetwork, symbol))
//       );
//     },
//     onError: () => setAllowance(false),
//   });

//   const encodedData = internalEnabled
//     ? encodeFunctionData({
//         abi: ERC20_TOKEN_ABI,
//         functionName: 'approve',
//         args: [spender, `${parseUnits(`${amount || 0}`,  getTokenDecimal(currentNetwork, symbol))}`],
//       })
//     : '0x0';

//   const { isFetching: isPrepareLoading, config } = usePrepareContractWrite({
//     address: walletAddress as Address,
//     abi: FUTUREPASS_ABI,
//     functionName: 'proxyCall',

//     account: signer as Address,
//     chainId,
//     value: BigInt(0),
//     args: [1, tokenAddress, BigInt(0), encodedData],
//     enabled: internalEnabled && encodedData !== '0x0',
//   });

//   const { data, writeAsync } = useContractWrite(config);

//   const { isLoading, isSuccess } = useWaitForTransaction({
//     hash: data?.hash,
//     enabled: !!data?.hash && isFpass,
//   });

//   const allow = async () => {
//     if (!isEvm || !isFpass) return;

//     await writeAsync?.();
//   };

//   return {
//     isLoading: isLoading || isReadLoading || isPrepareLoading,
//     isSuccess,
//     allowance: isConnected && allowance,
//     refetch,
//     allow,
//   };
// };
