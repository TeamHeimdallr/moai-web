import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { differenceInDays, differenceInSeconds, intervalToDuration } from 'date-fns';
import tw, { styled } from 'twin.macro';

import { useGetCampaignsQuery } from '~/api/api-server/campaign/get-campaigns';

import Logo1 from '~/assets/logos/logo-campaign-1.svg?react';
import Logo2 from '~/assets/logos/logo-campaign-2.svg?react';

import { BASE_URL } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons/primary';

import { usePopup } from '~/hooks/components/use-popup';
import { useMediaQuery } from '~/hooks/utils';
import { getRemainElapsedTime } from '~/utils';
import { POPUP_ID } from '~/types';

export const LayoutMainCampaign = () => {
  const [now, setNow] = useState(new Date());
  const [absoluteRemainTime, setAbsoluteRemainTime] = useState('00:00:00');

  const { isMD } = useMediaQuery();
  const { t } = useTranslation();

  const { opened: openedBanner } = usePopup(POPUP_ID.WALLET_ALERT);

  const { data: campaignData } = useGetCampaignsQuery(
    {
      queries: {
        filter: `active:eq:true:boolean`,
      },
    }
    // { staleTime: 5 * 60 * 1000 }
  );
  const campaigns = campaignData?.campaigns || [];

  const campaignXrplRoot = campaigns.find(c => c.name === 'campaign-xrpl-root');
  const campaignStartDate = useMemo(
    () => new Date(campaignXrplRoot?.startDate || new Date()),
    [campaignXrplRoot?.startDate]
  );

  const oneDayLeft = differenceInDays(campaignStartDate, now) < 1;
  const started = differenceInSeconds(campaignStartDate, now) <= 0;

  const remainElapsedTime = getRemainElapsedTime(campaignStartDate.getTime(), ' left');
  const splittedTime = remainElapsedTime.split(' ');
  const translatedTime =
    remainElapsedTime === 'Just now'
      ? t('Just now')
      : t(`${splittedTime[1]} ${splittedTime[2]}`, { time: splittedTime[0] });

  useEffect(() => {
    if (!oneDayLeft) return;

    const interval = setInterval(() => {
      const duration = intervalToDuration({ start: new Date(), end: campaignStartDate });
      const { hours, minutes, seconds } = duration;

      setAbsoluteRemainTime(
        `${(hours || 0).toString().padStart(2, '0')}:` +
          `${(minutes || 0).toString().padStart(2, '0')}:` +
          `${(seconds || 0).toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [campaignStartDate, oneDayLeft]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <MainWrapper banner={!!openedBanner}>
      <ContentWrapper>
        <TitleWrapper>
          <LogoWrapper>
            <Logo1 className="svg-shadow" width={isMD ? 249 : 149} height={isMD ? 70 : 24} />
            <Logo2 className="svg-shadow" width={isMD ? 489 : 293} height={isMD ? 70 : 24} />
          </LogoWrapper>
          <Description>{t('change-to-earn-root')}</Description>
        </TitleWrapper>

        {!started &&
          (oneDayLeft ? (
            <Timer style={{ fontWeight: 700, fontFamily: 'Roboto Mono' }}>
              {absoluteRemainTime}
            </Timer>
          ) : (
            <Timer>{t(translatedTime)}</Timer>
          ))}
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

    pt-132 pb-80 gap-24
    md:(pt-216 pb-152)
  `,
  banner &&
    tw`
      gap-12
      pt-184 pb-80
      md:(pt-276 pb-140 gap-24)
    `,
]);

const ContentWrapper = tw.div`
  flex-center flex-col gap-32
`;

const TitleWrapper = tw.div`
  flex-center flex-col gap-24
`;

const LogoWrapper = tw.div`
  flex-center gap-12 flex-col
  md:(flex-row gap-18 h-36 items-center)
`;

const Description = tw.div`
  font-r-14 leading-24 text-neutral-100 text-center
`;

const Timer = tw.div`
  px-26 py-12 rounded-12 bg-primary-60 text-neutral-0 font-m-16
`;
