import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import Skeleton from 'react-loading-skeleton';
import { format } from 'date-fns';
import tw, { styled } from 'twin.macro';

import { useCampaignLpBalance } from '~/api/api-contract/_evm/campaign/lp-balance';
import { useGetCampaignsQuery } from '~/api/api-server/campaign/get-campaigns';

import { IconTokenMoai, IconTokenRoot } from '~/assets/icons';
import Logo1 from '~/assets/logos/logo-campaign-1.svg?react';
import Logo2 from '~/assets/logos/logo-campaign-2.svg?react';

import { ButtonPrimaryLarge } from '~/components/buttons';

import { usePopup } from '~/hooks/components';
import { useMediaQuery } from '~/hooks/utils';
import { DATE_FORMATTER, formatNumber } from '~/utils';
import { POPUP_ID } from '~/types';

export const LayoutMain = () => (
  <Suspense fallback={<_LayoutMainSkeleton />}>
    <_LayoutMain />
  </Suspense>
);

const _LayoutMain = () => {
  const { balance, apr, moiApr } = useCampaignLpBalance();

  const { isMD } = useMediaQuery();
  const { t, i18n } = useTranslation();

  const { opened: openedLackOfRootBanner } = usePopup(POPUP_ID.LACK_OF_ROOT);

  const { data: campaignData } = useGetCampaignsQuery(
    { queries: { filter: `active:eq:true:boolean` } },
    { staleTime: 5 * 60 * 1000 }
  );
  const campaigns = campaignData?.campaigns || [];
  const campaignXrplRoot = campaigns.find(item => item.name === 'campaign-xrpl-root');

  return (
    <Wrapper banner={!!openedLackOfRootBanner}>
      <InnerWrapper>
        <ContentWrapper>
          <Title>{t('Activate your $XRP')}</Title>
          <LogoWrapper>
            <Logo1 className="svg-shadow" width={isMD ? 249 : 149} height={isMD ? 70 : 24} />
            <Logo2 className="svg-shadow" width={isMD ? 489 : 293} height={isMD ? 70 : 24} />
          </LogoWrapper>
          <TextMain>
            {t('campaign-landing-main-text')}
            {campaignXrplRoot && (
              <QuestDate>{`${format(
                new Date(campaignXrplRoot.startDate),
                DATE_FORMATTER.MMM_d_yyyy
              )} ~ ${format(
                new Date(campaignXrplRoot.endDate),
                DATE_FORMATTER.MMM_d_yyyy
              )}, (UTC)`}</QuestDate>
            )}
          </TextMain>
          <InfoWrapper>
            <Info>
              <Label>Total value locked</Label>
              <Text>${formatNumber(balance)}</Text>
            </Info>
            <Info>
              <Label>{t('Expected APR')}</Label>
              <TextInfoWrapper>
                <Text>{apr ? formatNumber(apr, 4, 'round', 10000) : '0'}%</Text>
                <AprInfoWrapper>
                  <AprInfo>
                    {moiApr ? `+${formatNumber(moiApr, 2, 'round', 10000)}%` : '0%'}
                    <IconTokenMoai width={16} height={16} />
                  </AprInfo>
                  <AprInfo>
                    {`+${formatNumber(10, 4, 'round', 10000)}%`}
                    <IconTokenRoot width={16} height={16} />
                  </AprInfo>
                </AprInfoWrapper>
              </TextInfoWrapper>
            </Info>
          </InfoWrapper>
        </ContentWrapper>

        <ButtonWrapper isKorean={i18n.language === 'ko'}>
          <ButtonPrimaryLarge
            text={t('Activate $XRP')}
            onClick={() => window.open('/campaign/participate', '_blank')}
          />
        </ButtonWrapper>
      </InnerWrapper>
    </Wrapper>
  );
};

const _LayoutMainSkeleton = () => {
  const { isMD } = useMediaQuery();
  const { t, i18n } = useTranslation();

  return (
    <Wrapper>
      <InnerWrapper>
        <ContentWrapper>
          <Title>{t('Activate your $XRP')}</Title>
          <LogoWrapper>
            <Logo1 className="svg-shadow" width={isMD ? 249 : 149} height={isMD ? 70 : 24} />
            <Logo2 className="svg-shadow" width={isMD ? 489 : 293} height={isMD ? 70 : 24} />
          </LogoWrapper>
          <TextMain>{t('campaign-landing-main-text')}</TextMain>
          <InfoWrapper>
            <Skeleton
              width={isMD ? '400px' : '100%'}
              height={100}
              highlightColor="#cccccc"
              baseColor="#b3b3b3"
              style={{
                opacity: 0.5,
                borderRadius: 12,
                backdropFilter: 'blur(2px)',
              }}
            />
            <Skeleton
              width={isMD ? '400px' : '100%'}
              height={100}
              highlightColor="#cccccc"
              baseColor="#b3b3b3"
              style={{
                opacity: 0.5,
                borderRadius: 12,
                backdropFilter: 'blur(2px)',
              }}
            />
          </InfoWrapper>
        </ContentWrapper>

        <ButtonWrapper isKorean={i18n.language === 'ko'}>
          <ButtonPrimaryLarge
            text={t('Activate $XRP')}
            onClick={() => window.open('/campaign/step', '_blank')}
          />
        </ButtonWrapper>
      </InnerWrapper>
    </Wrapper>
  );
};

interface WrapperProps {
  banner?: boolean;
}
export const Wrapper = styled.div<WrapperProps>(({ banner }) => [
  tw`
    w-full flex text-neutral-100 bg-no-repeat bg-campaign justify-center
    px-20 pt-96 pb-40 gap-40 bg-cover bg-center
    md:(gap-40 pt-160 pb-60 bg-right bg-top)
    xxl:(px-80)
  `,
  banner &&
    tw`
      pt-148
      md:(pt-220)
    `,
]);

const InnerWrapper = tw.div`
  flex flex-col justify-center w-full max-w-1280 gap-40
  md:(h-700)
`;

const ContentWrapper = tw.div`
  flex flex-col gap-24
  w-320
  md:(w-full)
  lg:(w-840)
`;
const Title = tw.div`
  font-b-20
`;

const LogoWrapper = tw.div`
  flex gap-12 flex-col
  md:(flex-row gap-18)
`;
interface ButtonProps {
  isKorean?: boolean;
}
const ButtonWrapper = styled.div<ButtonProps>(({ isKorean }) => [isKorean ? tw`w-183` : tw`w-156`]);

const TextMain = tw.div`
  w-full font-r-14 flex flex-col gap-12
  md:(font-r-16 whitespace-pre-line gap-16)
`;

const QuestDate = tw.div`
  text-primary-60 font-bold
`;

const InfoWrapper = tw.div`
  flex gap-20 flex-col
  md:(flex-row)
  xl:(gap-40)
`;
const Info = tw.div`
  w-full px-24 py-20 flex flex-col gap-12 rounded-12 bg-neutral-100 bg-opacity-10 backdrop-blur-sm
  md:gap-16
`;
const Label = tw.div`
  font-m-14 text-neutral-80
  md:font-m-16
`;
const Text = tw.div`
  font-m-20
  md:font-m-24
`;

const TextInfoWrapper = tw.div`
  flex flex-col gap-2
`;
const AprInfoWrapper = tw.div`
  flex gap-12
`;

const AprInfo = tw.div`
  flex gap-4 font-r-14 text-neutral-80 items-center
`;
