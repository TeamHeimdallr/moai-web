import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { motion } from 'framer-motion';
import ScrollTrigger from 'gsap/ScrollTrigger';
import tw, { css, styled } from 'twin.macro';

import { imageQuote } from '~/assets/images';
import { imageCampaignLighthouse, imageCampaignReward, imageCampaignToken } from '~/assets/images';

import { useMediaQuery } from '~/hooks/utils';

export const LayoutDescription = () => {
  const [highlightedTextNumber, setHighlightedTextNumber] = useState(0);

  const { isMD } = useMediaQuery();
  const { t } = useTranslation();

  const handleHighlight = (progress: number) => {
    if (progress < 1 / 3) setHighlightedTextNumber(1);
    else if (progress < 2 / 3) setHighlightedTextNumber(2);
    else setHighlightedTextNumber(3);
  };

  useEffect(() => {
    ScrollTrigger.create({
      trigger: '#voyage',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: self => handleHighlight(Number(self.progress.toFixed(2))),
    });
  }, []);

  return (
    <Wrapper>
      <InnerWrapper>
        <Section1Wrapper id="voyage">
          <Section1InnerWrapper>
            <QuoteImage src={imageQuote} width={isMD ? 68 : 34} height={isMD ? 60 : 30} />
            <Section1TextWrapper>
              <Section1Text highlighted={highlightedTextNumber === 1}>
                {t('description-focusing-text-1')}
              </Section1Text>
              <Section1Text highlighted={highlightedTextNumber === 2}>
                {t('description-focusing-text-2')}
              </Section1Text>
              <Section1Text highlighted={highlightedTextNumber === 3}>
                {t('description-focusing-text-3')}
              </Section1Text>
            </Section1TextWrapper>
          </Section1InnerWrapper>
        </Section1Wrapper>

        <Section2Wrapper>
          <Section2InnerWrapper alignLeft>
            <Section2ImageWrapper>
              <Image src={imageCampaignReward} />
            </Section2ImageWrapper>

            <Section2TextWrapper>
              <Section2Title>{t('description-title-1')}</Section2Title>
              <Section2Text>{t('description-text-1')}</Section2Text>
            </Section2TextWrapper>
          </Section2InnerWrapper>

          <Section2InnerWrapper>
            <Section2ImageWrapper>
              <Image src={imageCampaignToken} />
            </Section2ImageWrapper>

            <Section2TextWrapper>
              <Section2Title>{t('description-title-2')}</Section2Title>
              <Section2Text>{t('description-text-2')}</Section2Text>
            </Section2TextWrapper>
          </Section2InnerWrapper>

          <Section2InnerWrapper alignLeft>
            <Section2ImageWrapper>
              <Image src={imageCampaignLighthouse} />
            </Section2ImageWrapper>

            <Section2TextWrapper>
              <Section2Title>{t('description-title-3')}</Section2Title>
              <Section2Text>{t('description-text-3')}</Section2Text>
            </Section2TextWrapper>
          </Section2InnerWrapper>
        </Section2Wrapper>
      </InnerWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  relative w-full px-20 flex justify-center
  xxl:(px-80)
`;

const InnerWrapper = tw.div`
  w-full max-w-1280
`;

const Section1Wrapper = tw.div`
  flex w-full h-[400vh]
`;
const Section1InnerWrapper = tw.div`
  relative flex w-full h-screen sticky top-0
  justify-center py-140 gap-20
  md:(justify-start gap-40 py-280)
`;
const QuoteImage = tw(LazyLoadImage)``;
const Section1TextWrapper = tw.div`
  w-266 
  md:(w-405)
  lg:(w-606)
  xl:(w-732)
`;
interface TextProps {
  highlighted?: boolean;
}
const Section1Text = styled(motion.span)<TextProps>(({ highlighted }) => [
  tw`
    font-b-28 
    md:(font-b-48)
  `,
  highlighted ? tw`text-primary-60` : tw`text-neutral-40`,
  css`
    transition: color 0.5s;
  `,
]);

const Section2Wrapper = tw.div`
  flex flex-col w-full gap-80 pb-80
  md:(gap-120)
`;
interface Props {
  alignLeft?: boolean;
}
const Section2InnerWrapper = styled.div<Props>(({ alignLeft }) => [
  tw`
    flex flex-col w-full items-center gap-40
    md:(flex-row justify-between)
  `,
  alignLeft && tw`md:(flex-row-reverse)`,
]);

const Section2TextWrapper = tw.div`
  w-full flex flex-col gap-12 text-center
  md:(gap-24 text-left w-1/3) 
  xl:(w-400)
`;
const Section2Title = tw.div`
  w-full font-b-24 text-neutral-100
  md:(font-b-36)
`;
const Section2Text = tw.div`
  w-full font-m-18 text-neutral-100
  md:(font-m-20)
`;
const Section2ImageWrapper = tw.div`
  xs:(w-360)
  md:(w-2/3)
  xl:(w-auto)
`;
const Image = tw(LazyLoadImage)`
  w-full
  xl:w-auto
`;
