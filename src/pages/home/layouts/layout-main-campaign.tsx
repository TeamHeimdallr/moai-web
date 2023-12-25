import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { css } from '@emotion/react';
import { differenceInSeconds, intervalToDuration } from 'date-fns';
import tw, { styled } from 'twin.macro';

import { useGetCampaignsQuery } from '~/api/api-server/campaign/get-campaigns';

import Logo1 from '~/assets/logos/logo-campaign-1.svg?react';
import Logo2 from '~/assets/logos/logo-campaign-2.svg?react';

import { BASE_URL } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons/primary';

import { usePopup } from '~/hooks/components/use-popup';
import { useMediaQuery } from '~/hooks/utils';
import { POPUP_ID } from '~/types';

interface RemainTime {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}
export const LayoutMainCampaign = () => {
  const [now, setNow] = useState(new Date());
  const [remainTime, setRemainTime] = useState<RemainTime>({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  });

  const { isMD } = useMediaQuery();
  const { t } = useTranslation();

  const { opened: openedBanner } = usePopup(POPUP_ID.WALLET_ALERT);

  const { data: campaignData } = useGetCampaignsQuery(
    { queries: { filter: `active:eq:true:boolean` } },
    { staleTime: 5 * 60 * 1000 }
  );
  const campaigns = campaignData?.campaigns || [];

  const campaignXrplRoot = campaigns.find(c => c.name === 'campaign-xrpl-root');
  const campaignStartDate = useMemo(
    () => new Date(campaignXrplRoot?.startDate || new Date()),
    [campaignXrplRoot?.startDate]
  );

  const started = differenceInSeconds(campaignStartDate, now) <= 0;

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setNow(now);

      const duration = intervalToDuration({ start: now, end: campaignStartDate });
      const { days, hours, minutes, seconds } = duration;

      setRemainTime({
        days: (days || 0).toString().padStart(2, '0'),
        hours: (hours || 0).toString().padStart(2, '0'),
        minutes: (minutes || 0).toString().padStart(2, '0'),
        seconds: (seconds || 0).toString().padStart(2, '0'),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [campaignStartDate]);

  return (
    <MainWrapper banner={!!openedBanner}>
      <ContentWrapper>
        <ComingSoon>{t('Coming soon')}</ComingSoon>
        <TitleWrapper>
          <LogoWrapper>
            <Logo1 className="svg-shadow" width={isMD ? 223 : 149} height={isMD ? 36 : 24} />
            <Logo2 className="svg-shadow" width={isMD ? 439 : 293} height={isMD ? 36 : 24} />
          </LogoWrapper>
          <Description>{t('change-to-earn-root')}</Description>
        </TitleWrapper>

        {!started && (
          <CountDown>
            <DateWrapper>
              <DateLabel>{t('Days')}</DateLabel>
              <DateText>{remainTime.days}</DateText>
            </DateWrapper>
            <DateWrapper>
              <DateLabel>{t('Hours')}</DateLabel>
              <DateText>{remainTime.hours}</DateText>
            </DateWrapper>
            <DateWrapper>
              <DateLabel>{t('Mins')}</DateLabel>
              <DateText>{remainTime.minutes}</DateText>
            </DateWrapper>
            <DateWrapper>
              <DateLabel>{t('Secs')}</DateLabel>
              <DateText>{remainTime.seconds}</DateText>
            </DateWrapper>
          </CountDown>
        )}

        {started && (
          <ButtonPrimaryLarge
            text={t('Activate your $XRP')}
            buttonType="outlined"
            style={{ width: 'auto' }}
            onClick={() => window.open(`${BASE_URL}/campaign/participate`)}
          />
        )}
      </ContentWrapper>
    </MainWrapper>
  );
};

interface MainWrapperProps {
  banner?: boolean;
}
const MainWrapper = styled.div<MainWrapperProps>(({ banner }) => [
  tw`
    flex-center w-full bg-top bg-no-repeat bg-cover bg-campaign

    pt-104 pb-42 gap-24
    md:(pt-140 pb-122)
  `,
  banner &&
    tw`
      gap-12
      pt-156 pb-42
      md:(pt-200 pb-122 gap-24)
    `,
]);

const ContentWrapper = tw.div`
  flex-center flex-col gap-20
  md:(gap-24)
`;

const ComingSoon = tw.div`
  px-12 py-4 rounded-16 border-1 border-solid border-primary-50
  font-m-12 text-primary-50
`;

const TitleWrapper = tw.div`
  flex-center flex-col gap-20
  md:(gap-24)
`;

const LogoWrapper = tw.div`
  flex-center gap-12 flex-col
  md:(flex-row gap-14 h-36 items-center)
`;

const Description = tw.div`
  font-r-14 leading-24 text-neutral-100 text-center
  md:(font-r-16)
`;

const CountDown = tw.div`
  flex gap-8
`;

const DateWrapper = styled.div(() => [
  tw`
  px-20 py-16 flex-center flex-col gap-4 rounded-12
  md:(px-24 py-20)
`,
  css`
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(2px);
  `,
]);

const DateLabel = tw.div`
  text-neutral-70 font-m-12
  md:(font-m-14)
`;

const DateText = tw.div`
  text-neutral-100
  font-b-24 font-roboto
  md:(font-b-28 font-roboto)
`;
