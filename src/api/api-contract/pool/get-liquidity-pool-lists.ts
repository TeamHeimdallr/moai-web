import { CHAIN_ID } from '~/constants';
import { CHAIN_ID as CHAIN_ID_LINEA } from '~/constants/constant-chain-linea';
import { CHAIN_ID as CHAIN_ID_MANTLE } from '~/constants/constant-chain-mantle';
import { CHAIN_ID as CHAIN_ID_ROOT } from '~/constants/constant-chain-root';

import { liquidityPoolLists, myLiquidityPoolLists } from './data/liquidity-pool-list';

export const useGetLiquidityPoolLists = () => {
  if (CHAIN_ID === CHAIN_ID_MANTLE || CHAIN_ID === CHAIN_ID_LINEA)
    return liquidityPoolLists.mantle_linea;
  if (CHAIN_ID === CHAIN_ID_ROOT) return liquidityPoolLists.root;

  return liquidityPoolLists.mantle_linea;
};

export const useGetMyLiquidityPoolLists = () => {
  if (CHAIN_ID === CHAIN_ID_MANTLE || CHAIN_ID === CHAIN_ID_LINEA)
    return myLiquidityPoolLists.mantle_linea;
  if (CHAIN_ID === CHAIN_ID_ROOT) return myLiquidityPoolLists.root;

  return myLiquidityPoolLists.mantle_linea;
};
