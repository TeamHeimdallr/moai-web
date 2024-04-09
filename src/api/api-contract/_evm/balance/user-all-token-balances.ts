import { useParams } from 'react-router-dom';
import { Abi, Address, formatUnits } from 'viem';
import { useBalance, useContractReads } from 'wagmi';

import { useGetTokensQuery } from '~/api/api-server/token/get-tokens';

import { STABLE_POOL_ADDRESS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr, getNetworkFull, getWrappedTokenAddress } from '~/utils';
import { IToken, NETWORK } from '~/types';

import { ERC20_TOKEN_ABI } from '~/abi';
import { COMPOSABLE_STABLE_POOL_ABI } from '~/abi/composable-stable-pool';

/**
 * @description Get all token handling in moai finance balances for user
 */
interface Props {
  includeLpToken?: boolean;
}
export const useUserAllTokenBalances = (props: Props) => {
  const { includeLpToken } = props || {};

  const { network } = useParams();
  const { selectedNetwork, isEvm, isFpass } = useNetwork();
  const { evm, fpass } = useConnectedWallet();
  const { address: walletAddress } = isFpass ? fpass : evm;

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);
  const chainId = useNetworkId(currentNetwork);

  const { data: nativeBalance } = useBalance({ address: walletAddress as Address, chainId });

  const { data: tokensData } = useGetTokensQuery(
    {
      queries: {
        filter: `network:in:${currentNetworkAbbr}`,
        take: 100,
      },
    },
    { staleTime: 60 * 1000 }
  );
  const { tokens: _tokens } = tokensData || {};
  const tokens = _tokens?.filter(t => (includeLpToken ? true : !t.isLpToken)) as IToken[];

  const evmNetwork = [NETWORK.EVM_SIDECHAIN, NETWORK.THE_ROOT_NETWORK];
  const tokenAddresses =
    tokens?.filter(t => evmNetwork.includes(t.network) && !!t.address)?.map(t => t.address) || [];

  const { data: tokenTotalSupplyData, refetch: lpTokenRefetch } = useContractReads({
    contracts: tokenAddresses.map(address => {
      const isStable = !!STABLE_POOL_ADDRESS?.[currentNetwork]?.find(
        (add: string) => add.toLocaleLowerCase() === address.toLocaleLowerCase()
      );

      return {
        address: address as Address,
        abi: (isStable ? COMPOSABLE_STABLE_POOL_ABI : ERC20_TOKEN_ABI) as Abi,
        functionName: isStable ? 'getActualSupply' : 'totalSupply',
        chainId,
      };
    }),
    staleTime: 1000 * 3,
    enabled: tokenAddresses.length > 0 && !!chainId && !!walletAddress && isEvm && includeLpToken,
  });

  const { data: tokenBalancesData, refetch: tokenBalanceRefetch } = useContractReads({
    contracts: tokenAddresses.map(address => ({
      address: address as Address,
      abi: ERC20_TOKEN_ABI as Abi,
      functionName: 'balanceOf',
      args: [walletAddress as Address],
      chainId,
    })),
    staleTime: 1000 * 3,
    enabled: tokenAddresses.length > 0 && !!chainId && !!walletAddress && isEvm,
  });
  const { data: tokenDecimalsData } = useContractReads({
    contracts: tokenAddresses.map(address => ({
      address: address as Address,
      abi: ERC20_TOKEN_ABI as Abi,
      functionName: 'decimals',
      chainId,
    })),
    cacheTime: Infinity,
    staleTime: Infinity,
    enabled: tokenAddresses.length > 0 && !!chainId && !!walletAddress && isEvm,
  });

  const tokenBalancesRaw = (tokenBalancesData?.map(d => d.result) || []) as bigint[];
  const tokenDecimalsRaw = (tokenDecimalsData?.map(d => d.result) || []) as number[];
  const tokenTotalSupplyRaw = (tokenTotalSupplyData?.map(d => d.result) || []) as bigint[];

  const tokenBalances = tokenBalancesRaw.map((balance, i) =>
    Number(formatUnits(balance || 0n, tokenDecimalsRaw?.[i] || 18))
  );
  const tokenTotalSupply = tokenTotalSupplyRaw.map((supply, i) =>
    Number(formatUnits(supply || 0n, tokenDecimalsRaw?.[i] || 18))
  );

  const userAllTokens = (
    tokens?.map((t, i) => {
      if (
        currentNetwork === NETWORK.EVM_SIDECHAIN &&
        t.address === getWrappedTokenAddress(currentNetwork)
      ) {
        return {
          ...t,
          balance: Number(nativeBalance?.formatted || 0),
          totalSupply: 0,
        };
      }

      return {
        ...t,
        balance: tokenBalances?.[i] || 0,
        totalSupply: tokenTotalSupply?.[i] || 0,
      };
    }) || []
  ).sort((a, b) => a.symbol.localeCompare(b.symbol)) as (IToken & {
    balance: number;
    totalSupply: number;
  })[];

  const refetch = () => {
    if (tokenAddresses.length === 0 || !chainId || !walletAddress || !isEvm) return;
    lpTokenRefetch();
    tokenBalanceRefetch();
  };
  return {
    userAllTokenBalances: userAllTokens,
    refetch,
    fetchNextPage: () => {},
    hasNextPage: false,
  };
};
