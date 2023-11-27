import { LazyLoadImage } from 'react-lazy-load-image-component';
import tw from 'twin.macro';

import { imageWalletFuturepass } from '~/assets/images';
import LogoFutureverse from '~/assets/logos/logo-futureverse.svg?react';

export const Futureverse = () => {
  return (
    <Wrapper>
      <Text>In collaboration with</Text>
      <LogoWrapper>
        <LogoImage src={imageWalletFuturepass} />
        <LogoFutureverse />
      </LogoWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  relative w-full h-full flex flex-col gap-8 flex-center bg-[#0A0C13]
  py-119
  md:py-262 
  `;
const Text = tw.div`font-b-20 text-neutral-60 `;
const LogoWrapper = tw.div`flex gap-8 flex-center`;
const LogoImage = tw(LazyLoadImage)`w-80`;
