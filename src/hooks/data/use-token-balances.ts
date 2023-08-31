// TODO: fetch balance from wallet
export const useTokenBalances = () => {
  const tokenBalances = [
    { symbol: 'MOAI', balance: 2348.511 },
    { symbol: 'WETH', balance: 399.23042 },
    { symbol: 'USDC', balance: 1230.01 },
    { symbol: 'USDT', balance: 12123.32 },
  ];

  return { tokenBalances };
};
