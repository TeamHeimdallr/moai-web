export const getNetworkName = (network: string) => {
  return network === 'THE_ROOT_NETWORK'
    ? 'The Root Network'
    : network === 'EVM_SIDECHAIN'
    ? 'XRPL EVM Sidechain'
    : network === 'ETHEREUM'
    ? 'Ethereum'
    : 'XRPL';
};
