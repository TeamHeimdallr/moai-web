export const QUERY_KEYS = {
  TOKEN: {
    GET_XRP_BALANCE: ['xrp', 'ledger', 'token', 'balance', 'xrp'],
    GET_MOI_BALANCE: ['xrp', 'ledger', 'token', 'balance', 'moi'],
    GET_LIQUIDITY_TOKEN_BALANCE: ['xrp', 'ledger', 'token', 'balance', 'liquidity'],
    GET_TRUST_LINES: ['xrp', 'ledger', 'token', 'trust-lines'],
    SET_TRUST_LINE: ['mutate', 'xrp', 'ledger', 'token', 'trust-lines'],
  },
  AMM: {
    GET_AMM_INFO: ['xrp', 'ledger', 'amm', 'info'],
    GET_FEE: ['xrp', 'ledger', 'amm', 'fee'],
    GET_TRANSACTIONS: ['xrp', 'ledger', 'amm', 'transactions'],
    ADD_LIQUIDITY: ['mutate', 'xrp', 'ledger', 'amm', 'transactions'],
    WITHDRAW_LIQUIDITY: ['mutate', 'xrp', 'ledger', 'amm', 'transactions'],
  },
  SWAP: {},
};
