// TODO: query key 정리
export const QUERY_KEYS = {
  TOKEN: {
    GET_SYMBOLS: ['xrp-root', 'get', 'token', 'symbols'],

    GET_XRP_BALANCE: ['xrp', 'ledger', 'token', 'balance', 'xrp'],
    GET_MOI_BALANCE: ['xrp', 'ledger', 'token', 'balance', 'moi'],
    GET_LIQUIDITY_TOKEN_BALANCE: ['xrp', 'ledger', 'token', 'balance', 'liquidity'],
    GET_TRUST_LINES: ['xrp', 'ledger', 'token', 'trust-lines'],
    SET_TRUST_LINE: ['mutate', 'xrp', 'ledger', 'token', 'trust-lines'],
  },
  LIQUIIDITY_POOL: {
    GET_LISTS: ['xrp-root', 'get', 'liquidity-pool', 'pool-lists'],
    GET_PROVISIONS: ['xrp-root', 'get', 'liquidity-pool', 'pool-provisions'],
  },
  AMM: {
    GET_AMM_INFO: ['xrp', 'ledger', 'amm', 'info'],
    GET_FEE: ['xrp', 'ledger', 'amm', 'fee'],
    GET_TRANSACTIONS: ['xrp', 'ledger', 'amm', 'transactions'],
    ADD_LIQUIDITY: ['mutate', 'xrp', 'ledger', 'amm', 'transactions'],
    WITHDRAW_LIQUIDITY: ['mutate', 'xrp', 'ledger', 'amm', 'transactions'],
  },
  SWAP: {
    GET_HISTORIES: ['xrp-root', 'get', 'swap', 'histories'],
    SWAP: ['mutate', 'xrp', 'ledger', 'swap'],
  },
};
