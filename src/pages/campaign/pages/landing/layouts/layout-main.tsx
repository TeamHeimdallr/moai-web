import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import Skeleton from 'react-loading-skeleton';
import tw, { styled } from 'twin.macro';

import Logo1 from '~/assets/logos/logo-campaign-1.svg?react';
import Logo2 from '~/assets/logos/logo-campaign-2.svg?react';

import { ButtonPrimaryLarge } from '~/components/buttons';

import { useMediaQuery } from '~/hooks/utils';
import { formatNumberWithComma, formatPercent } from '~/utils';

export const LayoutMain = () => (
  <Suspense fallback={<_LayoutMainSkeleton />}>
    <_LayoutMain />
  </Suspense>
);

const _LayoutMain = () => {
  // TODO: connect api
  const value = 125928000;
  const apy = 0.1;

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
          <TextMain>
            {t('campaign-landing-main-text')}
            {/* TODO: change to quest datetime */}
            <QuestDate>28th Dec, 2023 ~ 28th Jan, 2024 (UTC)</QuestDate>
          </TextMain>
          <InfoWrapper>
            <Info>
              <Label>Total value locked</Label>
              <Text>${formatNumberWithComma(value)}</Text>
            </Info>
            <Info>
              <Label>{t('Expected APY')}</Label>
              <Text>{formatPercent(apy)}</Text>
            </Info>
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
          <TextMain>
            {t('campaign-landing-main-text')}
            {/* TODO: change to quest datetime */}
            <QuestDate>28th Dec, 2023 ~ 28th Jan, 2024 (UTC)</QuestDate>
          </TextMain>
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

export const Wrapper = tw.div`
  w-full flex text-neutral-100 bg-no-repeat bg-campaign justify-center
  px-20 pt-96 pb-40 gap-40 bg-cover bg-center
  md:(gap-40 pt-160 pb-60 bg-right bg-top)
  xxl:(px-80)
`;

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
