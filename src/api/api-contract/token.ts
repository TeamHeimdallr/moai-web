import { useContractRead } from 'wagmi';

import { TOKEN_ABI } from '~/abi/token';

export const useTokenInfos = (addresses: string[]) => {
  const [tokenA, tokenB, tokenC] = addresses;
  const {
    data: tokenAData,
    fetchStatus: tokenAFetchStatus,
    status: tokenAStatus,
    isSuccess: tokenAIsSuccess,
    isError: tokenAIsError,
  } = useContractRead({
    address: tokenA as `0x${string}`,
    abi: TOKEN_ABI,
    functionName: 'symbol',
    enabled: !!tokenA,
  });

  const {
    data: tokenBData,
    fetchStatus: tokenBFetchStatus,
    status: tokenBStatus,
    isSuccess: tokenBIsSuccess,
    isError: tokenBIsError,
  } = useContractRead({
    address: tokenB as `0x${string}`,
    abi: TOKEN_ABI,
    functionName: 'symbol',
    enabled: !!tokenB,
  });

  const {
    data: tokenCData,
    fetchStatus: tokenCFetchStatus,
    status: tokenCStatus,
    isSuccess: tokenCIsSuccess,
    isError: tokenCIsError,
  } = useContractRead({
    address: tokenC as `0x${string}`,
    abi: TOKEN_ABI,
    functionName: 'symbol',
    enabled: !!tokenC,
  });

  const isSuccess = tokenAIsSuccess && tokenBIsSuccess && tokenCIsSuccess;

  const isError = tokenAIsError || tokenBIsError || tokenCIsError;

  return {
    data: [tokenAData, tokenBData, tokenCData],
    isLoading:
      (tokenAFetchStatus === 'fetching' ||
        tokenBFetchStatus === 'fetching' ||
        tokenCFetchStatus === 'fetching') &&
      (tokenAStatus === 'loading' || tokenBStatus === 'loading' || tokenCStatus === 'loading'),
    isSuccess,
    isError,
  };
};
