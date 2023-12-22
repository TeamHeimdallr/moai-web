import { useTranslation } from 'react-i18next';
import tw, { styled } from 'twin.macro';

import Logo1 from '~/assets/logos/logo-campaign-1.svg?react';
import Logo2 from '~/assets/logos/logo-campaign-2.svg?react';

import { BASE_URL } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons/primary';

import { usePopup } from '~/hooks/components/use-popup';
import { useMediaQuery } from '~/hooks/utils';
import { POPUP_ID } from '~/types';

export const LayoutMainCampaign = () => {
  const { isMD } = useMediaQuery();
  const { t } = useTranslation();

  const { opened: openedBanner } = usePopup(POPUP_ID.WALLET_ALERT);

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
        <ButtonPrimaryLarge
          text={t('Activate your $XRP')}
          buttonType="outlined"
          style={{ width: 'auto' }}
          onClick={() => window.open(`${BASE_URL}/campaign/participate`)}
        />
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
