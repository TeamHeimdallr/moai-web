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
}

/**
 * popup id
 */
export enum POPUP_ID {
  STORYBOOK_SAMPLE = 'POPUP_STORYBOOK_SAMPLE',

  ADD_LP = 'POPUP_ADD_LP',
  WITHDRAW_LP = 'POPUP_WITHDRAW_LP',
  CAMPAIGN_WITHDRAW = 'CAMPAIGN_WITHDRAW',

  CONNECT_WALLET = 'POPUP_CONNECT_WALLET',
  CAMPAIGN_CONNECT_WALLET = 'CAMPAIGN_CONNECT_WALLET',

  NETWORK_ALERT = 'POPUP_NETWORK_ALERT',
  WALLET_ALERT = 'POPUP_WALLET_ALERT',

  REWARD_NETWORK_ALERT = 'POPUP_REWARD_NETWORK_ALERT',

  SWAP_SELECT_TOKEN_FROM = 'POPUP_SWAP_SELECT_TOKEN_FROM',
  SWAP_SELECT_TOKEN_TO = 'POPUP_SWAP_SELECT_TOKEN_TO',
  SWAP = 'POPUP_SWAP',

  FUTUREPASS_CREATE = 'POPUP_FUTUREPASS_CREATE',
  CAMPAIGN_FUTUREPASS_CREATE = 'CAMPAIGN_POPUP_FUTUREPASS_CREATE',

  XUMM_QR = 'XUMM_QR',
  LACK_OF_ROOT = 'LACK_OF_ROOT',
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
