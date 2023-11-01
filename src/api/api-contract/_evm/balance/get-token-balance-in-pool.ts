import { useParams } from 'react-router-dom';
import { fetchBalance } from '@wagmi/core';
import { formatUnits } from 'viem';
import { Address, useQuery } from 'wagmi';

import { QUERY_KEYS } from '~/api/utils/query-keys';

import { EVM_TOKEN_ADDRESS } from '~/constants';
import { EVM_POOL } from '~/constants';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { ITokenbalanceInPool } from '~/types';

import { useLiquidityPoolBalance } from '../pool/get-liquidity-pool-balance';

// TODO: implement new hook for swap
export const useTokenBalanceInPool = (): ITokenbalanceInPool => {
  const { network } = useParams();
  const { selectedNetwork, isEvm, isFpass } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const { evm, fpass } = useConnectedWallet();

  const { id } = useParams();

  // TODO: only for swap
  const { pool } = useLiquidityPoolBalance({
    id: (id ?? EVM_POOL?.[currentNetwork][0].id) as `0x${string}`,
  });
  const { compositions } = pool;

  const { address } = isFpass ? fpass : evm;

  const getTokenBalanceData = async () => {
    return Promise.all(
      compositions.map(token => {
        return fetchBalance({
          address: address as Address,
          token: EVM_TOKEN_ADDRESS?.[currentNetwork]?.[token.symbol] as Address,
        });
      })
    );
  };

  const { data: evmTokensData } = useQuery(
    [...QUERY_KEYS.TOKEN.GET_EVM_BALANCE, address],
    getTokenBalanceData,
    {
      enabled:
        isEvm &&
        !!address &&
        compositions.every(token => !!EVM_TOKEN_ADDRESS?.[currentNetwork]?.[token.symbol]),
    }
  );

  const success = evmTokensData !== undefined;

  if (!success)
    return {
      balancesMap: undefined,
      balancesArray: undefined,
    };

  const balancesMap = {};

  evmTokensData.forEach(token => {
    const price = compositions.find(t => t.symbol === token.symbol)?.price;

    balancesMap[token.symbol] = {
      symbol: token.symbol,
      balance: Number(formatUnits(token?.value ?? 0n, token?.decimals ?? 6)),
      value: Number(formatUnits(token?.value ?? 0n, token?.decimals ?? 6)) * (price ?? 0),
    };
  });

  const balancesArray = evmTokensData.map(token => {
    const price = compositions.find(t => t.symbol === token.symbol)?.price;

    return {
      symbol: token.symbol,
      balance: Number(formatUnits(token?.value ?? 0n, token?.decimals ?? 6)),
      value: Number(formatUnits(token?.value ?? 0n, token?.decimals ?? 6)) * (price ?? 0),
    };
  });

  return {
    balancesMap,
    balancesArray,
  };
};
