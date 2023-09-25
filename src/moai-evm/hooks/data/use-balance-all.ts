import { formatEther, isAddress } from 'viem';
import { useBalance } from 'wagmi';

import { TOKEN_ADDRESS, TOKEN_USD_MAPPER } from '~/moai-evm/constants';

import { TOKEN, TokenBalanceInfoAll } from '~/moai-evm/types/contracts';

import { useConnectEvmWallet } from './use-connect-evm-wallet';

export const useBalancesAll = (): TokenBalanceInfoAll => {
  const { address } = useConnectEvmWallet();
  const enabled = address && isAddress(address);

  const { data: moaiData } = useBalance({
    address,
    token: TOKEN_ADDRESS[TOKEN.MOAI],
    enabled: enabled && !!TOKEN_ADDRESS[TOKEN.MOAI],
    scopeKey: 'moai',
  });

  const { data: wethData } = useBalance({
    address,
    token: TOKEN_ADDRESS[TOKEN.WETH],
    enabled: enabled && !!TOKEN_ADDRESS[TOKEN.WETH],
    scopeKey: 'weth',
  });

  const success = moaiData && wethData;

  if (!success)
    return {
      balancesMap: undefined,
      balancesArray: undefined,
    };

  const moai = {
    balance: Number(formatEther(moaiData?.value ?? 0n)),
    value:
      Number(formatEther(moaiData?.value ?? 0n)) * (TOKEN_USD_MAPPER[moaiData?.symbol ?? ''] ?? 0),
    name: moaiData?.symbol ?? '',
  };

  const weth = {
    balance: Number(formatEther(wethData?.value ?? 0n)),
    value:
      Number(formatEther(wethData?.value ?? 0n)) * (TOKEN_USD_MAPPER[wethData?.symbol ?? ''] ?? 0),
    name: wethData?.symbol ?? '',
  };

  const balancesMap = {
    [TOKEN.MOAI]: moai,
    [TOKEN.WETH]: weth,
  };

  const balancesArray = [moai, weth];

  return {
    balancesMap,
    balancesArray,
  };
};
