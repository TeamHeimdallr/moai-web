import { NETWORK } from '..';

/**
 * tooltip id
 */
export enum TOOLTIP_ID {
  STORYBOOK_EXAMPLE = 'TOOLTIP_STORYBOOK_EXAMPLE',

  COMMING_SOON = 'TOOLTIP_COMMIG_SOON',
  COMMING_SOON_NETWORK_SELECTION = 'TOOLTIP_COMMIG_SOON_NETWORK_SELECTION',

  CAMPAIGN_FUTUREPASS = 'CAMPAIGN_FUTUREPASS',
  APR = 'APR',
  ENOUGH_XRP = 'ENOUGH_XRP',
  ADDRESS = 'ADDRESS',

  LENDING_NET_APY = 'NET_APY',
  LENDING_SUPPLY_APY = 'LENDING_APY',
  LENDING_SUPPLY_COLLATERAL = 'LENDING_SUPPLY_COLLATERAL',
  LENDING_SUPPLY_MY_COLLATERAL = 'LENDING_SUPPLY_MY_COLLATERAL',
  LENDING_SUPPLY_MY_ASSET_COLLATERAL = 'LENDING_SUPPLY_MY_ASSET_COLLATERAL',

  LENDING_BORROW_APY = 'LENDING_BORROW_APY',
  LENDING_BORROW_APY_TYPE = 'LENDING_BORROW_APY_TYPE',
  LENDING_BORROW_AVAIABLE = 'LENDING_BORROW_AVAIABLE',
  LENDING_BORROW_APY_VARIABLE = 'LENDING_BORROW_APY_VARIABLE',
  LENDING_BORROW_BORROW_POWER_USED = 'LENDING_BORROW_BORROW_POWER_USED',

  LENDING_DETAIL_TOTAL_SUPPLIED = 'LENDING_DETAIL_TOTAL_SUPPLIED',
  LENDING_DETAIL_MAX_LTV = 'LENDING_DETAIL_MAX_LTV',
  LENDING_DETAIL_LIQUIDATION_THRESHOLD = 'LENDING_DETAIL_LIQUIDATION_THRESHOLD',
  LENDING_DETAIL_LIQUIDATION_PENALTY = 'LENDING_DETAIL_LIQUIDATION_PENALTY',

  LENDING_ADD_TOKEN = 'LENDING_ADD_TOKEN',
  LENDING_VIEW_TOKEN_CONTRACT = 'LENDING_VIEW_TOKEN_CONTRACT',

  LENDING_DETAIL_TOTAL_BORROWED = 'LENDING_DETAIL_TOTAL_BORROWED',
  LENDING_DETAIL_BORROW_APY_STABLE = 'LENDING_DETAIL_BORROW_APY_STABLE',
  LENDING_DETAIL_BORROW_APY_VARIABLE = 'LENDING_DETAIL_BORROW_APY_VARIABLE',
  LENDING_DETAIL_BORROW_RESERVE_FACTOR = 'LENDING_DETAIL_BORROW_RESERVE_FACTOR',

  LENDING_DETAIL_AVAILABLE_TO_SUPPLY = 'LENDING_DETAIL_AVAILABLE_TO_SUPPLY',
  LENDING_DETAIL_AVAILABLE_TO_BORROW = 'LENDING_DETAIL_AVAILABLE_TO_BORROW',

  EVM_SIDECHAIN_FAUCET_ADD_TOKEN = 'EVM_SIDECHAIN_FAUCET_ADD_TOKEN',
}

/**
 * popup id
 */
export enum POPUP_ID {
  STORYBOOK_SAMPLE = 'POPUP_STORYBOOK_SAMPLE',

  ADD_LP = 'POPUP_ADD_LP',
  WITHDRAW_LP = 'POPUP_WITHDRAW_LP',
  CAMPAIGN_WITHDRAW = 'CAMPAIGN_WITHDRAW',
  CAMPAIGN_BRIDGE_TO_XRPL = 'CAMPAIGN_BRIDGE_TO_XRPL',

  CONNECT_WALLET = 'POPUP_CONNECT_WALLET',
  CAMPAIGN_CONNECT_WALLET = 'CAMPAIGN_CONNECT_WALLET',

  NETWORK_ALERT = 'POPUP_NETWORK_ALERT',
  WALLET_ALERT = 'POPUP_WALLET_ALERT',

  REWARD_NETWORK_ALERT = 'POPUP_REWARD_NETWORK_ALERT',

  ADD_LIQUIDITY_SELECT_TOKEN = 'ADD_LIQUIDITY_SELECT_TOKEN',
  SWAP_SELECT_TOKEN_FROM = 'POPUP_SWAP_SELECT_TOKEN_FROM',
  SWAP_SELECT_TOKEN_TO = 'POPUP_SWAP_SELECT_TOKEN_TO',
  SWAP = 'POPUP_SWAP',

  FUTUREPASS_CREATE = 'POPUP_FUTUREPASS_CREATE',
  CAMPAIGN_FUTUREPASS_CREATE = 'CAMPAIGN_POPUP_FUTUREPASS_CREATE',

  XUMM_QR = 'XUMM_QR',
  LACK_OF_ROOT = 'LACK_OF_ROOT',

  LENDING_HEALTH_FACTOR = 'LENDING_HEALTH_FACTOR',
  LENDING_CURRENT_LTV = 'LENDING_CURRENT_LTV',

  LENDING_SUPPLY_ENABLE_COLLATERAL = 'LENDING_SUPPLY_ENABLE_COLLATERAL',
  LENDING_SUPPLY_DISABLE_COLLATERAL = 'LENDING_SUPPLY_DISABLE_COLLATERAL',

  LENDING_SUPPLY = 'LENDING_SUPPLY',
  LENDING_BORROW = 'LENDING_BORROW',
  LENDING_WITHDRAW = 'LENDING_WITHDRAW',
  LENDING_REPAY = 'LENDING_REPAY',
}

/**
 * Gnb
 */
export interface IGnbMenu {
  id: string;
  text: string;
  path: string; // route path

  disabled?: boolean;
  commingSoon?: boolean; // if true, show comming soon tooltip

  show?: boolean;
  network: NETWORK[];
}

export interface IGnbChainList {
  network: NETWORK;
  text: string;

  show?: boolean;
  disabled?: boolean;
  commingSoon?: boolean; // if true, show comming soon tooltip
}

/**
 * table
 */
export interface ITableSort {
  key: string;
  order: 'asc' | 'desc';
}
