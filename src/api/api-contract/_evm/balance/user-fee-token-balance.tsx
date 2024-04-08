import { useParams } from 'react-router-dom';
import { Abi, Address, formatUnits } from 'viem';
import { useBalance, useContractRead } from 'wagmi';

import { useGetTokenQuery } from '~/api/api-server/token/get-token';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr, getNetworkFull } from '~/utils';
import { useFeeTokenStore } from '~/states/data/fee-proxy';
import { NETWORK } from '~/types';

import { ERC20_TOKEN_ABI } from '~/abi';

export const useUserFeeTokenBalance = () => {
  const { network } = useParams();
  const { selectedNetwork, isFpass } = useNetwork();
  const { evm, fpass } = useConnectedWallet();
  const { address: walletAddress } = isFpass ? fpass : evm;
  const { feeToken, isNativeFee } = useFeeTokenStore();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);
  const chainId = useNetworkId(currentNetwork);

  const isRoot = currentNetwork === NETWORK.THE_ROOT_NETWORK;

  const feeTokenEnabled = !isNativeFee && isRoot && isFpass;

  const { data: nativeBalance, refetch: refetchNative } = useBalance({
    address: walletAddress as Address,
    chainId,
  });

  const { data: xrpData } = useGetTokenQuery(
    {
      queries: {
        symbol: 'XRP',
        networkAbbr: currentNetworkAbbr,
      },
    },
    { staleTime: 10 * 1000 }
  );
  const { token: xrpToken } = xrpData || {};

  const { data: tokensData } = useGetTokenQuery(
    {
      queries: {
        symbol: feeTokenEnabled ? feeToken.name : 'XRP',
        networkAbbr: currentNetworkAbbr,
      },
    },
    { staleTime: 10 * 1000 }
  );
  const { token } = tokensData || {};

  const { data: feeTokenBalanceData, refetch: refetchFeeToken } = useContractRead({
    address: token?.address as Address,
    abi: ERC20_TOKEN_ABI as Abi,
    functionName: 'balanceOf',
    args: [walletAddress as Address],
    chainId,
    staleTime: 1000 * 3,
    enabled: !!token?.address && !!chainId && !!walletAddress && feeTokenEnabled,
  });

  const userFeeTokenBalanace = feeTokenEnabled
    ? Number(formatUnits((feeTokenBalanceData as bigint) || 0n, token?.decimal || 18))
    : Number(nativeBalance?.formatted || '0');

  const refetch = () => {
    refetchNative();
    refetchFeeToken();
  };

  const xrpBalance = {
    ...xrpToken,
    balance: Number(nativeBalance?.formatted || '0'),
    totalSupply: 0,
  };

  const tokenBalance = {
    ...token,
    balance: userFeeTokenBalanace,
    totalSupply: 0,
  };

  return {
    userXrpBalance: xrpBalance,
    userFeeTokenBalanace: tokenBalance,
    refetch,
    fetchNextPage: () => {},
    hasNextPage: false,
  };
};
