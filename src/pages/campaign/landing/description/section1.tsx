import { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import tw, { css, styled } from 'twin.macro';

import { imageQuote } from '~/assets/images';

import { useMediaQuery } from '~/hooks/utils';

export const Section1 = () => {
  const [highlightedTextNumber, setHighlightedTextNumber] = useState(0);

  const { isMD } = useMediaQuery();

  const handleHighlight = (progress: number) => {
    if (progress < 1 / 3) setHighlightedTextNumber(1);
    else if (progress < 2 / 3) setHighlightedTextNumber(2);
    else setHighlightedTextNumber(3);
  };

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.create({
    trigger: '#voyage',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: self => handleHighlight(Number(self.progress.toFixed(2))),
  });

  return (
    <Wrapper id="voyage">
      <InnerWrapper>
        <QuoteImage src={imageQuote} width={isMD ? 68 : 34} height={isMD ? 60 : 30} />
        <TextWrapper>
          <Text highlighted={highlightedTextNumber === 1}>{'"Voyage to the Future" '}</Text>
          <Text highlighted={highlightedTextNumber === 2}>
            {'marks the beginning of a new era in XRP ecosystem '}
          </Text>
          <Text highlighted={highlightedTextNumber === 3}>
            {'- one step towards a future of limitless possibilities.'}
          </Text>
        </TextWrapper>
      </InnerWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`flex w-full h-[400vh]`;
const InnerWrapper = tw.div`relative flex w-full h-screen py-140 gap-20 justify-center sticky top-0
  md:(justify-start gap-40 py-280)
`;
const QuoteImage = tw(LazyLoadImage)``;
const TextWrapper = tw.div`
  w-266 
  md:w-405 
  lg:w-732`;
interface TextProps {
  highlighted?: boolean;
}
const Text = styled(motion.span)<TextProps>(({ highlighted }) => [
  tw`font-b-28 
  md:font-b-48
  `,
  highlighted ? tw`text-primary-60` : tw`text-neutral-40`,
  css`
    transition: color 0.7s;
  `,
]);
