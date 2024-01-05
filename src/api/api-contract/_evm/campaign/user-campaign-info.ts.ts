import { Abi, Address, formatUnits } from 'viem';
import { useContractRead } from 'wagmi';

import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { CAMPAIGN_ADDRESS, POOL_ID } from '~/constants';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { NETWORK } from '~/types';

import { BALANCER_LP_ABI } from '~/abi';
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
  const { moiApr, compositions } = pool || {};

  const poolAddress = pool?.address;
  const xrpToken = compositions?.find(c => c.symbol === 'XRP');
  const rootToken = compositions?.find(c => c.symbol === 'ROOT');
  const rootTokenBalance = rootToken?.balance || 0;

  const xrpPrice = xrpToken?.price || 0;
  const rootPrice = rootToken?.price || 0;

  const { data, refetch: accureRefetch } = useContractRead({
    address: CAMPAIGN_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: CAMPAIGN_ABI as Abi,
    functionName: 'simulateAccrue',
    args: [walletAddress],

    staleTime: 1000 * 3,
    enabled: !!walletAddress && isEvm,
  });

  const { data: lpTokenTotalSupplyData } = useContractRead({
    address: poolAddress as Address,
    abi: BALANCER_LP_ABI as Abi,
    functionName: 'totalSupply',

    staleTime: 1000 * 3,
    enabled: !!poolAddress && isEvm,
  });

  const amountFarmedInBPTRaw = (data?.[0]?.['amountFarmed'] || 0n) as bigint;
  const unclaimedRootRewardRaw = (data?.[0]?.['unclaimedRewards'] || 0n) as bigint;
  const depositedTime = Number(data?.[0]['depositedTime'] ?? 0);

  const amountFarmedInBPT = Number(formatUnits(amountFarmedInBPTRaw, 18));
  const totalXrpValue = xrpPrice * amountFarmedInBPT;

  const amountFarmedInXrp = totalXrpValue / xrpPrice;

  const unclaimedRootReward = Number(formatUnits(unclaimedRootRewardRaw, 18));
  const lpTokenTotalSupply = Number(formatUnits((lpTokenTotalSupplyData || 0n) as bigint, 18));

  const r = lpTokenTotalSupply ? unclaimedRootReward / lpTokenTotalSupply : 0;
  const u = 2 * rootTokenBalance * r - rootTokenBalance * r * r;
  const rootReward = u / 2 + (u / 2) * (1 - 0.0035);

  const apr = (moiApr || 0) + 10; // moiApr + 10% (10% is the fixed ROOT APR)

  const refetch = () => {
    accureRefetch();
  };

  return {
    refetch,

    amountFarmedInBPT,
    amountFarmedInXrp,
    unclaimedRootReward,

    totalXrpValue,
    rootReward,

    amountFarmedInBPTRaw,
    unclaimedRootRewardRaw,

    apr,

    xrpPrice,
    rootPrice,

    depositedTime,
  };
};
