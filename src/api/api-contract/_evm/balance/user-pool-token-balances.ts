import { useParams } from 'react-router-dom';
import { Abi, Address, formatEther, formatUnits } from 'viem';
import { useBalance, useContractRead, useContractReads } from 'wagmi';

import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull, getWrappedTokenAddress } from '~/utils';
import { ITokenComposition, NETWORK } from '~/types';

import { BALANCER_LP_ABI, ERC20_TOKEN_ABI } from '~/abi';

export const useUserPoolTokenBalances = () => {
  const { network, id } = useParams();
  const { selectedNetwork, isEvm, isFpass } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const { evm, fpass } = useConnectedWallet();
  const { address: walletAddress } = isFpass ? fpass : evm;

  const queryEnabled = !!network && !!id;
  const { data: poolData } = useGetPoolQuery(
    {
      params: {
        networkAbbr: network as string,
        poolId: id as string,
      },
    },
    {
      enabled: queryEnabled,
      staleTime: 1000,
    }
  );

  const { pool } = poolData || {};
  const { address: poolAddress, compositions, lpToken } = pool || {};
  const { address: lpTokenAddress } = lpToken || {};

  const tokenAddresses = [lpTokenAddress, ...(compositions?.map(c => c.address) || [])];

  const { data: nativeBalance } = useBalance({ address: walletAddress as Address, chainId });

  const { data: lpTokenTotalSupplyData, refetch: lpTokenRefetch } = useContractRead({
    address: poolAddress as Address,
    abi: BALANCER_LP_ABI as Abi,
    functionName: 'totalSupply',
    chainId,

    staleTime: 1000 * 3,
    enabled: !!poolAddress && !!chainId && isEvm,
  });
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
    enabled: !!compositions && !!lpTokenAddress && !!chainId && !!walletAddress && isEvm,
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
    enabled: !!compositions && !!lpTokenAddress && !!chainId && isEvm,
  });

  const tokenBalancesRaw = (tokenBalancesData?.map(d => d.result) || []) as bigint[];
  const tokenDecimalsRaw = (tokenDecimalsData?.map(d => d.result) || 18) as number[];

  const tokenBalances = tokenBalancesRaw.map((balance, i) =>
    Number(formatUnits(balance || 0n, tokenDecimalsRaw?.[i] || 18))
  );

  const lpTokenBalance = tokenBalances?.[0] || 0;
  const lpTokenBalanceRaw = tokenBalancesRaw?.[0] || 0n;

  const lpTokenTotalSupply = Number(formatEther((lpTokenTotalSupplyData || 0n) as bigint));
  const lpTokenPrice = Number(lpTokenTotalSupply ? (pool?.value || 0) / lpTokenTotalSupply : 0);
  const lpTokenValue = lpTokenBalance * lpTokenPrice;

  const userPoolTokenBalances = tokenBalances?.slice(1) || [];
  const userPoolTokens = (compositions?.map((composition, i) => {
    if (
      currentNetwork === NETWORK.EVM_SIDECHAIN &&
      composition.address === getWrappedTokenAddress(currentNetwork)
    ) {
      return {
        ...composition,
        balance: Number(nativeBalance?.formatted || 0),
      };
    }

    return {
      ...composition,
      balance: userPoolTokenBalances?.[i] || 0,
    };
  }) || []) as (ITokenComposition & { balance: number })[];

  const userPoolTokenTotalValue = userPoolTokens.reduce((acc, cur) => {
    const tokenValue = (cur?.balance || 0) * (cur?.price || 0);
    return (acc += tokenValue);
  }, 0);

  const refetch = () => {
    lpTokenRefetch();
    tokenBalanceRefetch();
  };

  return {
    pool,
    lpToken,
    lpTokenPrice,
    lpTokenTotalSupply,

    userLpTokenBalance: lpTokenBalance,
    userLpTokenBalanceRaw: lpTokenBalanceRaw,
    userLpTokenValue: lpTokenValue,

    userPoolTokens,
    userPoolTokenTotalValue,

    refetch,
  };
};
