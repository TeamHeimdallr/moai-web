import { useEffect } from 'react';

import { useGetTokensQuery } from '~/api/api-server/token/get-tokens';

import { IS_MAINNET } from '~/constants';

import { IToken } from '~/types';

import { useSelecteNetworkStore, useSelecteTokenStore } from '../states';

const ETHEREUM_TRN_TOKEN_LISTS = ['ETH', 'ROOT', 'USDC', 'USDT'];
const ETHEREUM_TOKEN_ADDRESS_MAP = {
  ROOT: IS_MAINNET
    ? '0xa3d4BEe77B05d4a0C943877558Ce21A763C4fa29'
    : '0x2E3B1351F37C8E5a97706297302E287A93ff4986',
  USDC: IS_MAINNET
    ? '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    : '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8',
  USDT: IS_MAINNET
    ? '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    : '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
};

const THE_ROOT_NETWORK_ETHEREUM_TOKEN_ADDRESS_MAP = {
  ETH: IS_MAINNET
    ? '0xccCcCccC00000464000000000000000000000000'
    : '0xccCcCccC00000464000000000000000000000000',
  ROOT: IS_MAINNET
    ? '0xcCcCCccC00000001000000000000000000000000'
    : '0xcCcCCccC00000001000000000000000000000000',
  USDC: IS_MAINNET
    ? '0xCCcCCcCC00000C64000000000000000000000000'
    : '0xcCcCCCCc00000864000000000000000000000000',
  USDT: IS_MAINNET
    ? '0xCCCccccc00001864000000000000000000000000'
    : '0xcCcCCCCc00000864000000000000000000000000', // USDC
};
const THE_ROOT_NETWORK_XRP_TOKEN_ADDRESS_MAP = {
  XRP: IS_MAINNET
    ? '0xCCCCcCCc00000002000000000000000000000000'
    : '0xCCCCcCCc00000002000000000000000000000000',
};

const XRPL_THE_ROOT_NETWORK_TOKEN_LISTS = ['XRP'];

export const useSelectToken = () => {
  const { token, selectToken } = useSelecteTokenStore();
  const { from, to } = useSelecteNetworkStore();

  const { data } = useGetTokensQuery(
    { queries: { tokens: 'eth,xrp,root,usdc,usdt' } },
    { staleTime: 10 * 1000 }
  );

  const { tokens } = data || {};

  const uniqTokens = tokens?.reduce<Record<string, IToken>>((acc, cur) => {
    if (acc[cur.symbol]) return acc;
    return { ...acc, [cur.symbol]: cur };
  }, {});

  const getSelectable = (from: string, to: string) => {
    if (from === 'ETHEREUM') {
      if (to === 'THE_ROOT_NETWORK')
        return ETHEREUM_TRN_TOKEN_LISTS.map(symbol => {
          const address = ETHEREUM_TOKEN_ADDRESS_MAP[symbol];
          const tokenData = uniqTokens?.[symbol];

          return {
            ...tokenData,
            symbol,
            address,
          };
        });
      return [];
    }

    if (from === 'THE_ROOT_NETWORK') {
      if (to === 'ETHEREUM')
        return ETHEREUM_TRN_TOKEN_LISTS.map(symbol => {
          const address = THE_ROOT_NETWORK_ETHEREUM_TOKEN_ADDRESS_MAP[symbol];
          const tokenData = uniqTokens?.[symbol];

          return {
            ...tokenData,
            symbol,
            address,
          };
        });
      if (to === 'XRPL')
        return XRPL_THE_ROOT_NETWORK_TOKEN_LISTS.map(symbol => {
          const address = THE_ROOT_NETWORK_XRP_TOKEN_ADDRESS_MAP[symbol];
          const tokenData = uniqTokens?.[symbol];

          return {
            ...tokenData,
            symbol,
            address,
          };
        });
      return [];
    }

    if (from === 'XRPL') {
      if (to === 'THE_ROOT_NETWORK')
        return XRPL_THE_ROOT_NETWORK_TOKEN_LISTS.map(symbol => {
          const address = THE_ROOT_NETWORK_XRP_TOKEN_ADDRESS_MAP[symbol];
          const tokenData = uniqTokens?.[symbol];

          return {
            ...tokenData,
            symbol,
            address,
          };
        });
      return [];
    }
  };

  const selectableToken = getSelectable(from, to) || [];

  useEffect(() => {
    if (!token.symbol && selectableToken[0]?.image) {
      selectToken({
        symbol: selectableToken[0].symbol,
        address: selectableToken[0].address,
        currency: selectableToken[0].currency || '',
        image: selectableToken[0].image,
        decimal: selectableToken[0].decimal,
        price: selectableToken[0].price,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectableToken[0]?.image, token.symbol]);

  return { selectableToken, token, selectToken };
};
