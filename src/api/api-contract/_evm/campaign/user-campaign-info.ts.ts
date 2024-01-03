import { Abi, Address, formatUnits } from 'viem';
import { useContractRead } from 'wagmi';

import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { CAMPAIGN_ADDRESS, POOL_ID } from '~/constants';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { NETWORK } from '~/types';

import { CAMPAIGN_ABI } from '~/abi/campaign';

export const useUserCampaignInfo = () => {
  const { isEvm, isFpass } = useNetwork();

  const { evm, fpass } = useConnectedWallet();
  const { address: walletAddress } = isFpass && fpass.address ? fpass : evm;

  const { data: poolData } = useGetPoolQuery(
    {
      params: {
        networkAbbr: 'trn',
        poolId: POOL_ID[NETWORK.THE_ROOT_NETWORK].ROOT_XRP,
      },
    },
    { staleTime: 10 * 1000 }
  );

  const { pool } = poolData || {};
  const { moiApr, compositions, lpToken } = pool || {};

  const xrpToken = compositions?.find(c => c.symbol === 'XRP');
  const rootToken = compositions?.find(c => c.symbol === 'ROOT');

  const xrpPrice = xrpToken?.price || 0;
  const rootPrice = rootToken?.price || 0;
  const lpTokenPrice = lpToken?.price || 0;

  const { data, refetch: accureRefetch } = useContractRead({
    address: CAMPAIGN_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: CAMPAIGN_ABI as Abi,
    functionName: 'simulateAccrue',
    args: [walletAddress],

    staleTime: 1000 * 3,
    enabled: !!walletAddress && isEvm,
  });

  const amountFarmedInBPTRaw = (data?.[0]?.['amountFarmed'] || 0n) as bigint;
  const unclaimedRootRewardRaw = (data?.[0]?.['unclaimedRewards'] || 0n) as bigint;

  const amountFarmedInBPT = Number(formatUnits(amountFarmedInBPTRaw, 18));
  const totalBptValue = lpTokenPrice * amountFarmedInBPT;

  const amountFarmedInXrp = totalBptValue / xrpPrice;
  const unclaimedRootReward = Number(formatUnits(unclaimedRootRewardRaw, 6));

  const apr = (moiApr || 0) + 10; // moiApr + 10% (10% is the fixed ROOT APR)

  const refetch = () => {
    accureRefetch();
  };

  return {
    refetch,

    amountFarmedInBPT,
    amountFarmedInXrp,
    unclaimedRootReward,

    totalBptValue,

    amountFarmedInBPTRaw,
    unclaimedRootRewardRaw,

    apr,

    xrpPrice,
    rootPrice,
  };
};
