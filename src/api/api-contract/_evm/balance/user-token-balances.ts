import { useParams } from 'react-router-dom';
import { Abi, Address, formatUnits } from 'viem';
import { useBalance, useContractReads } from 'wagmi';

import { useGetTokensQuery } from '~/api/api-server/token/get-tokens';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull, getWrappedTokenAddress } from '~/utils';
import { IToken, NETWORK } from '~/types';

import { ERC20_TOKEN_ABI } from '~/abi';

type Token = IToken & {
  balance: number;
  totalSupply: number;
};
interface Props {
  addresses: string[];
}
export const useUserTokenBalances = ({ addresses }: Props) => {
  const { network } = useParams();
  const { selectedNetwork, isEvm, isFpass } = useNetwork();
  const { evm, fpass } = useConnectedWallet();
  const { address: walletAddress } = isFpass ? fpass : evm;

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const { data: tokensData } = useGetTokensQuery(
    {
      queries: {
        filter: `address:in:${addresses.join(',')}`,
      },
    },
    { staleTime: 60 * 1000 }
  );
  const { tokens } = tokensData || {};

  const { data: nativeBalance } = useBalance({ address: walletAddress as Address, chainId });

  const { data: tokenTotalSupplyData, refetch: lpTokenRefetch } = useContractReads({
    contracts: addresses.flatMap(address => [
      {
        address: address as Address,
        abi: ERC20_TOKEN_ABI as Abi,
        functionName: 'totalSupply',
        chainId,
      },
    ]),
    staleTime: 1000 * 3,
    enabled: addresses.length > 0 && !!chainId && !!walletAddress && isEvm,
  });

  const { data: tokenBalancesData, refetch: tokenBalanceRefetch } = useContractReads({
    contracts: addresses.flatMap(address => [
      {
        address: address as Address,
        abi: ERC20_TOKEN_ABI as Abi,
        functionName: 'balanceOf',
        args: [walletAddress as Address],
        chainId,
      },
    ]),
    staleTime: 1000 * 3,
    enabled: addresses.length > 0 && !!chainId && !!walletAddress && isEvm,
  });
  const { data: tokenDecimalsData } = useContractReads({
    contracts: addresses.flatMap(address => [
      {
        address: address as Address,
        abi: ERC20_TOKEN_ABI as Abi,
        functionName: 'decimals',
        chainId,
      },
    ]),
    cacheTime: Infinity,
    staleTime: Infinity,
    enabled: addresses.length > 0 && !!chainId && !!walletAddress && isEvm,
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

  const userTokens = (
    addresses?.map((address, i) => {
      const token = tokens?.find(t => t.address === address);
      if (
        currentNetwork === NETWORK.EVM_SIDECHAIN &&
        address === getWrappedTokenAddress(currentNetwork)
      ) {
        return {
          ...token,
          balance: Number(nativeBalance?.formatted || 0),
          totalSupply: 0,
        };
      }

      return {
        ...token,
        balance: tokenBalances?.[i] || 0,
        totalSupply: tokenTotalSupply?.[i] || 0,
      };
    }) as Token[]
  )?.sort((a, b) => a?.symbol?.localeCompare(b?.symbol));

  const refetch = () => {
    lpTokenRefetch();
    tokenBalanceRefetch();
  };

  return {
    userTokenBalances: userTokens,
    refetch,
  };
};
