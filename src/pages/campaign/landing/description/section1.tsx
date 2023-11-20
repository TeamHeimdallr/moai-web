import { useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import tw, { styled } from 'twin.macro';

import { imageQuote } from '~/assets/images';

export const Section1 = () => {
  const [highlightedTextNumber, setHighlightedTextNumber] = useState(0);

  const handleHighlight = (progress: number) => {
    console.log(progress);
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
        <QuoteImage src={imageQuote} width={68} height={60} />
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
const InnerWrapper = tw.div`flex w-full h-screen py-280 gap-40 justify-start sticky top-0`;
const QuoteImage = tw.img``;
const TextWrapper = tw.div`w-732`;
interface TextProps {
  highlighted?: boolean;
}
const Text = styled(motion.span)<TextProps>(({ highlighted }) => [
  tw`font-b-48`,
  highlighted ? tw`text-primary-60` : tw`text-neutral-40`,
]);
