import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { css } from '@emotion/react';
import tw, { styled } from 'twin.macro';
import { formatUnits } from 'viem';

import { useUserLpFarmDeposited } from '~/api/api-contract/_evm/balance/lp-farm-balance';
import { useUserPoolTokenBalances } from '~/api/api-contract/balance/user-pool-token-balances';
import { useGetTokenQuery } from '~/api/api-server/token/get-token';

import { COLOR } from '~/assets/colors';
import { IconDown, IconFarming, IconTokenRoot } from '~/assets/icons';

import { LP_FARM_ADDRESS_WITH_POOL_ID, TRILLION } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { formatNumber, getNetworkAbbr } from '~/utils';
import { NETWORK, POPUP_ID } from '~/types';

import { FarmPopup } from './lp-farm-popup';
import { UnfarmPopup } from './lp-unfarm-popup';

export const LpFarmTool = () => {
  const { ref } = useGAInView({ name: 'pool-detail-lp-farm' });
  const { gaAction } = useGAAction();

  const [opened, open] = useState(false);

  const { opened: unfarmPopupOpened, open: unfarmPopupOpen } = usePopup(POPUP_ID.LP_UNFARM);
  const { opened: farmPopupOpened, open: farmPopupOpen } = usePopup(POPUP_ID.LP_FARM);

  const { id } = useParams();

  // const { isMD } = useMediaQuery();
  const { t } = useTranslation();

  const { selectedNetwork } = useNetwork();
  const networkAbbr = getNetworkAbbr(NETWORK.THE_ROOT_NETWORK);

  const isRoot = selectedNetwork === NETWORK.THE_ROOT_NETWORK;
  const farmAddress = LP_FARM_ADDRESS_WITH_POOL_ID?.[NETWORK.THE_ROOT_NETWORK]?.[id ?? ''];
  const isLpFarmExisted = isRoot && farmAddress && farmAddress !== '0x0';

  const {
    deposited,
    pending,
    totalDeposited,
    rewardPerBlockRaw,
    refetch: refetchFarm,
  } = useUserLpFarmDeposited({
    farmAddress,
    enabled: isLpFarmExisted,
  });

  const {
    lpTokenPrice,
    userLpTokenBalance,
    refetch: refetchLp,
  } = useUserPoolTokenBalances({
    network: 'trn',
    id: id ?? '',
  });

  const rootAddress = '0xcCcCCccC00000001000000000000000000000000';
  const { data: tokenData } = useGetTokenQuery(
    { queries: { networkAbbr, address: rootAddress } },
    { enabled: !!rootAddress && !!networkAbbr }
  );
  const { token: rootToken } = tokenData || {};

  const handleFarm = () => {
    farmPopupOpen();
  };

  const handleUnFarm = () => {
    unfarmPopupOpen();
  };

  useEffect(() => {
    refetchFarm();
    refetchLp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmPopupOpened, unfarmPopupOpened]);

  const blocktime = 4; // TRN's blocktime
  const rewardValuesInYear =
    (365 *
      24 *
      60 *
      60 *
      Number(formatUnits(rewardPerBlockRaw || 0n, 6)) *
      (rootToken?.price || 0)) /
    blocktime;
  const totalDepositedValue = totalDeposited * lpTokenPrice;
  const formatedApr =
    totalDepositedValue !== 0
      ? formatNumber((100 * rewardValuesInYear) / totalDepositedValue, 0, 'round', TRILLION, 0)
      : Infinity;
  // TODO: if currentblock > endblock => apr = 0
  const depositedValue = deposited * lpTokenPrice;
  const userLpTokenBalanceValue = userLpTokenBalance * lpTokenPrice;
  const pendingValue = pending * (rootToken?.price || 0);

  // TODO
  const isFarmPrepareError = false;
  const isUnFarmPrepareError = false;

  if (!isLpFarmExisted) return <></>;
  return (
    <Wrapper ref={ref}>
      <InnerWrapper opened={opened}>
        <TitleWrapper
          onClick={() => {
            gaAction({
              action: 'pool-detail-lp-farm-open',
              data: { page: 'pool-detail', component: 'lp-farm', open: !opened },
            });
            open(prev => !prev);
          }}
        >
          <TitleWithApr>
            <Apr>{`APR ${formatedApr}%`}</Apr>
            <TitleWithIcon>
              <IconFarming
                fill={opened ? COLOR.GREEN[50] : COLOR.NEUTRAL[0]}
                width={24}
                height={24}
              />
              <Title opened={opened}> {t('Farming Incentives')} </Title>
            </TitleWithIcon>
          </TitleWithApr>
          <Icon opened={opened}>
            <IconDown fill={COLOR.NEUTRAL[60]} width={24} height={24} />
          </Icon>
        </TitleWrapper>
        {opened && (
          <>
            <Divider />
            <ContentWrapper>
              <TokenInfoWrapper>
                <TokenInfo>
                  <FarmedText>{t('Farmed LP Tokens')}</FarmedText>
                  <BalanceWrapper>
                    <Balance>{formatNumber(deposited, 4)}</Balance>
                    <Value>{`$${formatNumber(depositedValue)}`}</Value>
                  </BalanceWrapper>
                </TokenInfo>
                <TokenInfo>
                  <FarmedText>{t('Unfarmed LP Tokens')}</FarmedText>
                  <BalanceWrapper>
                    <Balance>{formatNumber(userLpTokenBalance, 4)}</Balance>
                    <Value>{`$${formatNumber(userLpTokenBalanceValue)}`}</Value>
                  </BalanceWrapper>
                </TokenInfo>
              </TokenInfoWrapper>
              <ButtonWrapper>
                <ButtonInnerWrapper>
                  <ButtonPrimaryLarge
                    text={t('Farm')}
                    onClick={handleFarm}
                    disabled={userLpTokenBalanceValue <= 0}
                  ></ButtonPrimaryLarge>
                  {!!deposited && deposited > 0 && (
                    <ButtonPrimaryLarge
                      buttonType="outlined"
                      text={t('Unfarm')}
                      onClick={handleUnFarm}
                    ></ButtonPrimaryLarge>
                  )}
                </ButtonInnerWrapper>
              </ButtonWrapper>
              {!!pending && pending > 0 && (
                <RewardWarpper>
                  <RewardTitle>{t('Farming Rewards')}</RewardTitle>
                  <RewardAmount>
                    <IconTokenRoot width={36} height={36} />
                    <RewardBalanceWrapper>
                      <Balance>{`${formatNumber(pending, 4)} ROOT`}</Balance>
                      <Value>{`$${formatNumber(pendingValue)}`}</Value>
                    </RewardBalanceWrapper>
                  </RewardAmount>
                </RewardWarpper>
              )}
            </ContentWrapper>
          </>
        )}
        {farmPopupOpened && !isFarmPrepareError && !unfarmPopupOpened && (
          <FarmPopup poolId={id || ''} />
        )}
        {unfarmPopupOpened && !isUnFarmPrepareError && !farmPopupOpened && (
          <UnfarmPopup poolId={id || ''} />
        )}
      </InnerWrapper>
    </Wrapper>
  );
};

interface DivProps {
  opened?: boolean;
}

const Wrapper = styled.div(() => [
  tw`
    flex flex-col w-full gap-4 rounded-12 p-2
  `,
  css`
    background: linear-gradient(123deg, #f3ff66 -13.53%, #43cf9d 118.65%);
  `,
]);

const InnerWrapper = styled.div<DivProps>(({ opened }) => [
  tw`
    w-full h-full bg-neutral-10 rounded-12
  `,
  !opened &&
    css`
      background: linear-gradient(123deg, #f3ff66 -13.53%, #43cf9d 118.65%);
    `,
]);

const TitleWrapper = tw.div`
  flex justify-between items-center gap-4 pt-18 pb-20 px-22 clickable
`;
const Title = styled.div<DivProps>(({ opened }) => [
  tw`font-b-20 text-neutral-0`,
  opened &&
    css`
      background: linear-gradient(123deg, #f3ff66 -13.53%, #43cf9d 118.65%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    `,
]);
const TitleWithApr = tw.div`
  flex flex-col gap-4 font-b-20 text-neutral-0
`;
const Apr = tw.div`
  bg-neutral-20 rounded-17 gap-4 px-10 py-2 font-m-12 text-green-50 flex flex-center
  w-max
`;
const TitleWithIcon = tw.div`
  flex gap-8
`;
const Icon = styled.div<DivProps>(({ opened }) => [
  tw`
    p-0 transition-transform flex-center clickable
    md:(p-4)
  `,
  css`
    transform: rotate(${opened ? '-180deg' : '0deg'});
  `,
]);
const ButtonWrapper = tw.div`
  flex w-full gap-24 pt-20 pb-24 px-22
`;
const ButtonInnerWrapper = tw.div`
  flex w-full gap-8
`;
const Divider = tw.div`
  flex h-1 bg-neutral-15
`;
const ContentWrapper = tw.div`
  flex flex-col justify-between items-center
`;

const TokenInfoWrapper = tw.div`
  flex flex-col px-22 py-12 gap-16 bg-neutral-10 w-full
`;
const TokenInfo = tw.div`
  flex justify-between gap-4 w-full items-center
`;
const FarmedText = tw.div`
  font-r-18 text-neutral-100
`;
const BalanceWrapper = tw.div`
  flex flex-col items-end
`;
const RewardBalanceWrapper = tw.div`
  flex flex-col items-start
`;
const Balance = tw.div`
  font-m-20 text-neutral-100
`;

const Value = tw.div`
  font-r-14 text-neutral-60
`;

const RewardWarpper = tw.div`
  flex flex-col gap-8 bg-neutral-15 w-full pt-20 pb-22 px-22 rounded-b-12
`;
const RewardTitle = tw.div`
  flex gap-2 font-m-16 text-neutral-80
`;
const RewardAmount = tw.div`
  flex gap-12 items-center
`;
