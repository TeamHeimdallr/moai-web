import { useParams } from 'react-router-dom';
import { Abi, Address, formatUnits } from 'viem';
import { useContractReads } from 'wagmi';

import { useGetTokensQuery } from '~/api/api-server/token/get-tokens';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr, getNetworkFull } from '~/utils';
import { IToken, NETWORK } from '~/types';

import { ERC20_TOKEN_ABI } from '~/abi';

/**
 * @description Get all token handling in moai finance balances for user
 */
export const useUserAllTokenBalances = () => {
  const { network } = useParams();
  const { selectedNetwork, isEvm, isFpass } = useNetwork();
  const { evm, fpass } = useConnectedWallet();
  const { address: walletAddress } = isFpass ? fpass : evm;

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);
  const chainId = useNetworkId(currentNetwork);

  const { data: tokensData } = useGetTokensQuery(
    {
      queries: {
        filter: `network:in:${currentNetworkAbbr}`,
      },
    },
    { staleTime: 60 * 1000 }
  );
  const { tokens } = tokensData || {};

  const evmNetwork = [NETWORK.EVM_SIDECHAIN, NETWORK.THE_ROOT_NETWORK];
  const tokenAddresses =
    tokens?.filter(t => evmNetwork.includes(t.network) && !!t.address)?.map(t => t.address) || [];

  const { data: tokenTotalSupplyData, refetch: lpTokenRefetch } = useContractReads({
    contracts: tokenAddresses.flatMap(address => [
      {
        address: address as Address,
        abi: ERC20_TOKEN_ABI as Abi,
        functionName: 'totalSupply',
        chainId,
      },
    ]),
    staleTime: 1000 * 3,
    enabled: tokenAddresses.length > 0 && !!chainId && !!walletAddress && isEvm,
  });
  // {result: 1251160352435284165912n, status: 'success'}
  // {result: 61040214099625n, status: 'success'}
  // {result: 12498841392677n, status: 'success'}
  // {result: 1007130003554671011669716690n, status: 'success'}
  // {result: 285441387884162419558n, status: 'success'}

  const { data: tokenBalancesData, refetch: tokenBalanceRefetch } = useContractReads({
    contracts: tokenAddresses.flatMap(address => [
      {
        address: address as Address,
        abi: ERC20_TOKEN_ABI as Abi,
        functionName: 'balanceOf',
        args: [walletAddress as Address],
        chainId,
      },
    ]),
    staleTime: 1000 * 3,
    enabled: tokenAddresses.length > 0 && !!chainId && !!walletAddress && isEvm,
  });
  const { data: tokenDecimalsData } = useContractReads({
    contracts: tokenAddresses.flatMap(address => [
      {
        address: address as Address,
        abi: ERC20_TOKEN_ABI as Abi,
        functionName: 'decimals',
        chainId,
      },
    ]),
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

  const userAllTokens = (tokens?.map((t, i) => ({
    ...t,
    balance: tokenBalances?.[i] || 0,
    totalSupply: tokenTotalSupply?.[i] || 0,
  })) || []) as (IToken & {
    balance: number;
    totalSupply: number;
  })[];

  const refetch = () => {
    lpTokenRefetch();
    tokenBalanceRefetch();
  };
  return {
    userAllTokenBalances: userAllTokens,
    refetch,
  };
};
