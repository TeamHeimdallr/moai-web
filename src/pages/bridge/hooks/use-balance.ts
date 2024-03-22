import { useQuery } from '@tanstack/react-query';
import { Abi, formatUnits } from 'viem';
import { Address, useBalance as useBalanceWagmi, useContractReads } from 'wagmi';
import { AccountInfoResponse } from 'xrpl';

import { useXrpl } from '~/hooks/contexts';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { useTheRootNetworkSwitchWalletStore } from '~/states/contexts/wallets/switch-wallet';

import { ERC20_TOKEN_ABI } from '~/abi';
import { theRootNetwork } from '~/configs/evm-network';

import { useSelectNetwork } from './use-select-network';
import { useSelectToken } from './use-select-token';

export const useBalance = () => {
  const { selectedWallet: selectedWalletTRN } = useTheRootNetworkSwitchWalletStore();

  const { from, to } = useSelectNetwork();
  const { selectableToken } = useSelectToken();

  const { isEvm, isFpass } = useNetwork();
  const { evm, xrp, fpass } = useConnectedWallet();

  const evmAddress = isFpass
    ? fpass?.address
    : isEvm
    ? evm?.address
    : selectedWalletTRN === 'fpass'
    ? fpass?.address
    : evm?.address;
  const xrpAddress = xrp?.address || '';

  const { data: xrpBalanceData } = useBalanceWagmi({
    scopeKey: 'TRN_NATIVE',
    address: evmAddress as Address,
    chainId: theRootNetwork.id,
    enabled: from === 'THE_ROOT_NETWORK' && !!evmAddress,
    staleTime: 10 * 1000,
  });

  // from ETHEREUM
  /*
  const { data: ethBalanceData } = useBalanceWagmi({
    scopeKey: 'EVM_NATIVE',
    address: evmAddress as Address,
    chainId: IS_MAINNET ? mainnet.id : sepolia.id,
    enabled: from === 'ETHEREUM' && to === 'THE_ROOT_NETWORK' && !!evmAddress,
    staleTime: 10 * 1000,
  });

  const { data: ethTokenBalanceData } = useContractReads({
    scopeKey: 'EVM_TOKEN',
    contracts:
      selectableToken
        ?.filter(t => t.symbol !== 'ETH')
        ?.map(token => ({
          address: token.address as Address,
          abi: ERC20_TOKEN_ABI as Abi,
          functionName: 'balanceOf',
          chainId: IS_MAINNET ? mainnet.id : sepolia.id,
          args: [evmAddress as Address],
        })) || [],
    enabled:
      from === 'ETHEREUM' &&
      to === 'THE_ROOT_NETWORK' &&
      !!evmAddress &&
      selectableToken &&
      selectableToken.length > 0,
    staleTime: 10 * 1000,
  });
  const { data: ethTokenDecimalData } = useContractReads({
    scopeKey: 'EVM_TOKEN_DECIMAL',
    contracts:
      selectableToken
        ?.filter(t => t.symbol !== 'ETH')
        ?.map(token => ({
          address: token.address as Address,
          abi: ERC20_TOKEN_ABI as Abi,
          functionName: 'decimals',
          chainId: IS_MAINNET ? mainnet.id : sepolia.id,
        })) || [],
    enabled:
      from === 'ETHEREUM' &&
      to === 'THE_ROOT_NETWORK' &&
      !!evmAddress &&
      selectableToken &&
      selectableToken.length > 0,
    staleTime: Infinity,
  });
  const ethTokenDecimals = ethTokenDecimalData?.map(data => data.result as number);
  const ethTokenBalance = ethTokenBalanceData?.map((data, i) =>
    Number(formatUnits((data?.result || 0n) as bigint, ethTokenDecimals?.[i] || 18))
  );
  const ethRootBalance = ethTokenBalance?.[0] || 0;
  const ethUsdcBalance = ethTokenBalance?.[1] || 0;
  const ethUsdtBalance = ethTokenBalance?.[2] || 0;

  const ethBalance =
    from === 'ETHEREUM' && to === 'THE_ROOT_NETWORK'
      ? selectableToken?.map(token => {
          const balance =
            token.symbol === 'ETH'
              ? Number(ethBalanceData?.formatted)
              : token.symbol === 'ROOT'
              ? ethRootBalance
              : token.symbol === 'USDC'
              ? ethUsdcBalance
              : token.symbol === 'USDT'
              ? ethUsdtBalance
              : 0;

          return { ...token, balance };
        })
      : [];

  // from THE_ROOT_NETWORK to ETHEREUM
 
  const { data: trnEthTokenBalanceData } = useContractReads({
    scopeKey: 'TRN_EVM_TOKEN',
    contracts:
      selectableToken?.map(token => ({
        address: token.address as Address,
        abi: ERC20_TOKEN_ABI as Abi,
        functionName: 'balanceOf',
        chainId: theRootNetwork.id,
        args: [evmAddress as Address],
      })) || [],
    enabled:
      from === 'THE_ROOT_NETWORK' &&
      to === 'ETHEREUM' &&
      !!evmAddress &&
      selectableToken &&
      selectableToken.length > 0,
    staleTime: 10 * 1000,
  });
  const { data: trnEthTokenDecimalData } = useContractReads({
    scopeKey: 'TRN_EVM_TOKEN_DECIMAL',
    contracts:
      selectableToken?.map(token => ({
        address: token.address as Address,
        abi: ERC20_TOKEN_ABI as Abi,
        chainId: theRootNetwork.id,
        functionName: 'decimals',
      })) || [],
    enabled:
      from === 'THE_ROOT_NETWORK' &&
      to === 'ETHEREUM' &&
      !!evmAddress &&
      selectableToken &&
      selectableToken.length > 0,
    staleTime: Infinity,
  });
  const trnEthTokenDecimals = trnEthTokenDecimalData?.map(data => data.result as number);
  const trnEthTokenBalance = trnEthTokenBalanceData?.map((data, i) =>
    Number(formatUnits((data?.result || 0n) as bigint, trnEthTokenDecimals?.[i] || 18))
  );
  const trnEthEtheBalance = trnEthTokenBalance?.[0] || 0;
  const trnEthRootBalance = trnEthTokenBalance?.[1] || 0;
  const trnEthUsdcBalance = trnEthTokenBalance?.[2] || 0;
  const trnEthUsdtBalance = trnEthTokenBalance?.[3] || 0;

  const trnEthBalance =
    from === 'THE_ROOT_NETWORK' && to === 'ETHEREUM'
      ? selectableToken?.map(token => {
          const balance =
            token.symbol === 'ETH'
              ? trnEthEtheBalance
              : token.symbol === 'ROOT'
              ? trnEthRootBalance
              : token.symbol === 'USDC'
              ? trnEthUsdcBalance
              : token.symbol === 'USDT'
              ? trnEthUsdtBalance
              : 0;

          return { ...token, balance };
        })
      : [];
  */

  // from THE_ROOT_NETWORK to XRPL
  const { data: trnXrplTokenBalanceData } = useContractReads({
    scopeKey: 'TRN_XRP_TOKEN',
    contracts:
      selectableToken?.map(token => ({
        address: token.address as Address,
        abi: ERC20_TOKEN_ABI as Abi,
        functionName: 'balanceOf',
        chainId: theRootNetwork.id,
        args: [evmAddress as Address],
      })) || [],
    enabled:
      from === 'THE_ROOT_NETWORK' &&
      to === 'XRPL' &&
      !!evmAddress &&
      selectableToken &&
      selectableToken.length > 0,
    staleTime: 10 * 1000,
  });
  const { data: trnXrplTokenDecimalData } = useContractReads({
    scopeKey: 'TRN_EVM_TOKEN_DECIMAL',
    contracts:
      selectableToken?.map(token => ({
        address: token.address as Address,
        abi: ERC20_TOKEN_ABI as Abi,
        chainId: theRootNetwork.id,
        functionName: 'decimals',
      })) || [],
    enabled:
      from === 'THE_ROOT_NETWORK' &&
      to === 'XRPL' &&
      !!evmAddress &&
      selectableToken &&
      selectableToken.length > 0,
    staleTime: Infinity,
  });

  const trnXrplTokenDecimals = trnXrplTokenDecimalData?.map(data => data.result as number);
  const trnXrplTokenBalance = trnXrplTokenBalanceData?.map((data, i) =>
    Number(formatUnits((data?.result || 0n) as bigint, trnXrplTokenDecimals?.[i] || 18))
  );
  const trnXrplXrpBalance = trnXrplTokenBalance?.[0] || 0;

  const trnXrplBalance =
    from === 'THE_ROOT_NETWORK' && to === 'XRPL'
      ? selectableToken?.map(token => {
          const balance = token.symbol === 'XRP' ? trnXrplXrpBalance : 0;
          return { ...token, balance };
        })
      : [];

  // from XRPL to THE_ROOT_NETWORK
  const xrplXrpTokenBalanceRequest = {
    command: 'account_info',
    account: xrpAddress,
  };
  const { client, isConnected } = useXrpl();
  const { data: xrplXrpTokenBalanceData } = useQuery<AccountInfoResponse>(
    ['GET', 'XRPL', 'ACCOUNT_INFO', xrpAddress],
    () => client.request(xrplXrpTokenBalanceRequest),
    {
      enabled: !!client && isConnected && !!xrpAddress,
      staleTime: 1000 * 10,
    }
  );
  const xrplTrnXrpTokenbalance = Number(
    formatUnits(BigInt(xrplXrpTokenBalanceData?.result?.account_data?.Balance || 0), 6)
  );
  const xrplXrpBalance =
    from === 'XRPL' && to === 'THE_ROOT_NETWORK'
      ? selectableToken?.map(token => {
          const balance = token.symbol === 'XRP' ? xrplTrnXrpTokenbalance : 0;
          return { ...token, balance };
        })
      : [];

  const getBalance = () => {
    // if (from === 'ETHEREUM' && to === 'THE_ROOT_NETWORK') return ethBalance;
    // if (from === 'THE_ROOT_NETWORK' && to === 'ETHEREUM') return trnEthBalance;
    if (from === 'THE_ROOT_NETWORK' && to === 'XRPL') return trnXrplBalance;
    if (from === 'XRPL' && to === 'THE_ROOT_NETWORK') return xrplXrpBalance;
    return [];
  };

  const getGasBalance = () => {
    // if (from === 'ETHEREUM') return Number(ethBalanceData?.formatted || '0');
    if (from === 'THE_ROOT_NETWORK') return Number(xrpBalanceData?.formatted || '0');
    if (from === 'XRPL') return Number(xrplXrpTokenBalanceData?.result?.account_data?.Balance || 0);
    return 0;
  };

  return {
    balances: getBalance(),
    gasBalance: getGasBalance(),
  };
};
