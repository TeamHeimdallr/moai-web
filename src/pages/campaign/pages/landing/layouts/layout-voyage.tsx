import { Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Skeleton from 'react-loading-skeleton';
import { differenceInSeconds, intervalToDuration } from 'date-fns';
import { debounce } from 'lodash-es';
import tw, { styled } from 'twin.macro';

import { useCampaignInfo } from '~/api/api-contract/_evm/campaign/campaign-info';
import { useClaim } from '~/api/api-contract/_evm/campaign/claim';
import {
  useClaim as useClaimSubstrate,
  useClaimPrepare,
} from '~/api/api-contract/_evm/campaign/claim-substrate';
import { useUserCampaignInfo } from '~/api/api-contract/_evm/campaign/user-campaign-info.ts';
import { useUserAllTokenBalances } from '~/api/api-contract/balance/user-all-token-balances';
import { useUserPoolTokenBalances } from '~/api/api-contract/balance/user-pool-token-balances';
import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';
import { useGetRewardsInfoQuery } from '~/api/api-server/rewards/get-reward-info';

import { IconTokenMoai, IconTokenRoot } from '~/assets/icons';

import { BASE_URL } from '~/constants';
import { POOL_ID } from '~/constants';

import { ButtonPrimaryLarge, ButtonPrimaryMedium } from '~/components/buttons';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr } from '~/utils';
import { useWalletConnectorTypeStore } from '~/states/contexts/wallets/connector-type';
import { NETWORK, POPUP_ID } from '~/types';

import { useCampaignStepStore } from '../../participate/states/step';
import { Pending } from '../components/pending';
import { TokenListVertical } from '../components/token-list-vertical';
import { WithdrawLiquidityPopup } from '../components/withdraw-liquidity-popup';

export const LayoutVoyage = () => (
  <Suspense fallback={<_LayoutVoyageSkeleton />}>
    <_LayoutVoyage />
  </Suspense>
);

interface RemainLockupTime {
  hours: string;
  minutes: string;
  seconds: string;
}
const _LayoutVoyage = () => {
  const [hasPending2, setHasPending2] = useState(false); // for visibility change
  const [estimatedClaimFee, setEstimatedClaimFee] = useState<number | undefined>();

  const { isEvm, selectedNetwork, isFpass } = useNetwork();
  const { xrp, evm, fpass } = useConnectedWallet();
  const [now, setNow] = useState(new Date());
  const [remainTime, setRemainTime] = useState<RemainLockupTime>({
    hours: '00',
    minutes: '00',
    seconds: '00',
  });

  const { setWalletConnectorType } = useWalletConnectorTypeStore();

  const { open } = usePopup(POPUP_ID.CAMPAIGN_CONNECT_WALLET);
  const { t } = useTranslation();

  const walletAddress = isFpass ? fpass?.address : isEvm ? evm?.address : xrp?.address;

  const { userAllTokenBalances } = useUserAllTokenBalances();

  const userXrp = userAllTokenBalances?.find(t => t.symbol === 'XRP');
  const userXrpBalance = userXrp?.balance || 0;

  const { data: rewardInfoData } = useGetRewardsInfoQuery(
    {
      params: { networkAbbr: 'trn' },
      queries: { walletAddress },
    },
    { staleTime: 1000 * 3, enabled: !!walletAddress }
  );

  const campaignReward = rewardInfoData?.myCampaignReward || 0;

  const {
    amountFarmedInBPT,
    depositedTime,

    rootReward,
    rootPrice,
    refetch: userCampaignInfoRefetch,
  } = useUserCampaignInfo();
  const isRoot = selectedNetwork === NETWORK.THE_ROOT_NETWORK;
  const poolId = POOL_ID?.[NETWORK.THE_ROOT_NETWORK]?.ROOT_XRP;

  const queryEnabled = !!isRoot && !!poolId;
  const { data: poolData } = useGetPoolQuery(
    {
      params: {
        networkAbbr: getNetworkAbbr(NETWORK.THE_ROOT_NETWORK) as string,
        poolId: poolId as string,
      },
    },
    {
      enabled: queryEnabled,
      staleTime: 1000,
    }
  );

  const { pool } = poolData || {};
  const { compositions } = pool || {};
  const xrpToken = compositions?.[1];
  const xrpBalanceInPool = xrpToken?.balance || 0;

  /* claim */
  const claimEvm = useClaim();
  const claimSubstrate = useClaimSubstrate();
  const { isPrepareError: claimSubstratePrepareIsError, prepareError: claimSubstratePrepareError } =
    useClaimPrepare();

  const claim = isFpass ? claimSubstrate : claimEvm;
  const {
    isLoading: claimLoading,
    isError: claimIsError,
    isSuccess: claimIsSuccess,
    txData: claimTxData,
    error: claimError,
    writeAsync,
    estimateFee: estimateClaimFee,
  } = claim;

  const isErrorRaw = claimIsError || claimSubstratePrepareIsError;
  const error = claimError || claimSubstratePrepareError;
  const approveError = error?.message?.includes('Approved');
  const isError = isErrorRaw && !approveError;
  const claimGasError = userXrpBalance < (estimatedClaimFee || 0);

  /* withdraw */
  const { opened: withdrawPopupOpened, open: withdrawPopupOpen } = usePopup(
    POPUP_ID.CAMPAIGN_WITHDRAW
  );

  const { lpTokenPrice, lpTokenTotalSupply, refetch } = useUserPoolTokenBalances({
    network: 'trn',
    id: POOL_ID?.[selectedNetwork]?.ROOT_XRP,
  });

  const { step, stepStatus, lastSuccessAt, lastUpdatedAt } = useCampaignStepStore();
  const hasPending =
    step >= 1 &&
    stepStatus.some(s => s.status === 'done') &&
    differenceInSeconds(new Date(lastSuccessAt), new Date(lastUpdatedAt)) <= 0;

  const { lockupPeriod } = useCampaignInfo();

  const myDepositBalance = amountFarmedInBPT;
  const myDepositValue = myDepositBalance * lpTokenPrice;

  const myDepositInXrp = 2 * (myDepositBalance / lpTokenTotalSupply) * xrpBalanceInPool;

  const bothConnected = xrp.isConnected && evm.isConnected;
  const isEmpty = !(bothConnected && amountFarmedInBPT > 0);

  const emptyText = !bothConnected
    ? 'To check your voyage, connect both your XRP\n wallet and Root Network wallet.'
    : "You haven't activated your $XRP yet.";

  const buttonText = !bothConnected ? 'Connect wallet' : 'Activate $XRP';

  const nowTime = now.getTime() / 1000;
  const withdrawLiquidityEnabled =
    !!myDepositBalance && myDepositBalance > 0n && depositedTime + lockupPeriod < nowTime;
  const isLocked = depositedTime + lockupPeriod >= nowTime;

  const lockupEndDate = useMemo(
    () => new Date(1000 * (depositedTime + lockupPeriod) || new Date()),
    [depositedTime, lockupPeriod]
  );

  const handleClick = () => {
    if (!isEmpty || bothConnected) return window.open(`${BASE_URL}/campaign/participate`, '_blank');

    if (!xrp.isConnected) setWalletConnectorType({ network: NETWORK.XRPL });
    else if (!evm.isConnected) setWalletConnectorType({ network: NETWORK.THE_ROOT_NETWORK });

    open();
  };

  useEffect(() => {
    const listener = () => {
      const moaiCampaign = JSON.parse(localStorage.getItem('MOAI_CAMPAIGN') || '{}');
      if (!moaiCampaign) return;

      const { step, stepStatus } = moaiCampaign?.state || {};
      if (!step || !stepStatus) return;

      const hasPending =
        step >= 1 &&
        stepStatus.some(
          (s: { id: number; status: 'idle' | 'loading' | 'done' }) => s.status === 'done'
        );
      if (hasPending) setHasPending2(true);
      else setHasPending2(false);
    };

    listener();
    document.addEventListener('visibilitychange', listener);
    return () => {
      document.removeEventListener('visibilitychange', listener);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setNow(now);

      const duration = intervalToDuration({ start: now, end: lockupEndDate });
      const { hours, minutes, seconds } = duration;

      setRemainTime({
        hours: (hours || 0).toString().padStart(2, '0'),
        minutes: (minutes || 0).toString().padStart(2, '0'),
        seconds: (seconds || 0).toString().padStart(2, '0'),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lockupEndDate]);

  const withdrawButtonText = isLocked
    ? `${t('Can withdraw after')} ${remainTime.hours}:${remainTime.minutes}:${remainTime.seconds}`
    : t('Withdraw');

  useEffect(() => {
    if (estimatedClaimFee) return;

    const estimateFeeAsync = debounce(async () => {
      const fee = await estimateClaimFee?.();
      setEstimatedClaimFee(fee);
    }, 1000);

    estimateFeeAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEvm, isFpass, walletAddress, rootReward, estimatedClaimFee]);

  useEffect(() => {
    if (claimIsSuccess && claimTxData) userCampaignInfoRefetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claimIsSuccess, claimTxData]);

  return (
    <Wrapper>
      <InnerWrapper>
        <MyInfoWrapper>
          <Title>{t('My Voyage')}</Title>

          {isEmpty && (
            <Empty>
              <TextWrapper>{emptyText}</TextWrapper>
              <ButtonWrapper>
                <ButtonPrimaryMedium
                  text={t(buttonText)}
                  buttonType="outlined"
                  onClick={handleClick}
                />
              </ButtonWrapper>
            </Empty>
          )}
          {!isEmpty && (
            <CardWrapper>
              <TokenCard>
                <TokenCardTitle>{t('My liquidity')}</TokenCardTitle>
                <TokenListVertical
                  token="50ROOT-50XRP"
                  balance={myDepositBalance}
                  value={myDepositValue}
                  convertedToken={pool?.compositions?.[1]}
                  convertedBalance={myDepositInXrp}
                  image={
                    <BadgeWrapper style={{ width: 2 * 28 + 12 }}>
                      {pool?.compositions?.map((token, idx) => {
                        const { symbol, image } = token;
                        return (
                          <Badge key={symbol + idx} style={{ left: idx * 28 }}>
                            <Image src={image} />
                          </Badge>
                        );
                      })}
                    </BadgeWrapper>
                  }
                  button={
                    <ButtonPrimaryLarge
                      text={withdrawButtonText}
                      buttonType="outlined"
                      onClick={withdrawPopupOpen}
                      disabled={!withdrawLiquidityEnabled}
                    />
                  }
                />
              </TokenCard>
              <TokenCard col2>
                <TokenCardTitle>{t('Rewards')}</TokenCardTitle>
                <TokenListWrapper>
                  <TokenListVertical
                    token="veMOI"
                    balance={campaignReward}
                    image={<IconTokenMoai width={36} height={36} />}
                    button={
                      <ButtonPrimaryLarge
                        text={t('Coming soon')}
                        buttonType="filled"
                        disabled
                        onClick={() => console.log('claim')}
                      />
                    }
                  />
                  <TokenListVertical
                    token="ROOT"
                    balance={rootReward}
                    value={rootReward * rootPrice}
                    image={<IconTokenRoot width={36} height={36} />}
                    button={
                      <ButtonPrimaryLarge
                        text={claimGasError ? t('Not enough gas') : t('Claim')}
                        buttonType="outlined"
                        isLoading={claimLoading}
                        disabled={isError || !estimatedClaimFee || claimGasError}
                        onClick={() => writeAsync()}
                      />
                    }
                  />
                </TokenListWrapper>
              </TokenCard>
            </CardWrapper>
          )}
        </MyInfoWrapper>
        {hasPending && hasPending2 && <Pending />}
        {withdrawPopupOpened && withdrawLiquidityEnabled && (
          <WithdrawLiquidityPopup
            pool={pool}
            lpTokenPrice={lpTokenPrice}
            refetchBalance={refetch}
          />
        )}
      </InnerWrapper>
    </Wrapper>
  );
};

const _LayoutVoyageSkeleton = () => {
  const { t } = useTranslation();

  return (
    <Wrapper>
      <Title>{t('My Voyage')}</Title>
      <Skeleton
        height={194}
        baseColor="#2B2E44"
        highlightColor="#23263A"
        style={{ borderRadius: 12 }}
      />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full flex-center pt-60 pb-120 text-neutral-100
  md:(px-20)
  xxl:(px-80)
`;

const InnerWrapper = tw.div`
  flex-center flex-col w-full max-w-1280 gap-24
`;

const MyInfoWrapper = tw.div`
  w-full flex flex-col gap-24 justify-center
`;

const CardWrapper = tw.div`
  w-full flex flex-col
  gap-20
  lg:(grid grid-cols-3)
  xl:(gap-40)
`;

interface TokenCardProps {
  col2?: boolean;
}
const TokenCard = styled.div<TokenCardProps>(({ col2 }) => [
  tw`
    w-full flex flex-wrap flex-col gap-24 p-24 pt-20 bg-neutral-10 rounded-12
  `,
  col2 && tw`lg:(col-span-2)`,
]);

const TokenCardTitle = tw.div`
  font-b-18
  md:(font-b-20)
`;

const TokenListWrapper = tw.div`
  flex flex-col gap-16
  md:(flex-row)
`;

const Title = tw.div`
  px-20 font-b-20 text-neutral-100
  md:(font-b-24)
`;
const Empty = tw.div`
  flex-center flex-col h-194 gap-20 bg-neutral-10 rounded-12 text-neutral-80
`;

const TextWrapper = tw.div`
  font-r-14 text-center whitespace-pre-wrap
  md:(font-r-16 whitespace-nowrap)
`;

const ButtonWrapper = tw.div`
  flex-center w-144
`;

const BadgeWrapper = tw.div`
  flex inline-flex items-center relative h-40
`;

const Badge = tw.div`
  w-40 h-40 absolute flex-center
`;

const Image = tw(LazyLoadImage)`
  w-40 h-40 object-cover flex-center
`;
