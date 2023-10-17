import tw from 'twin.macro';

import LogoLanding from '~/assets/logos/logo-landing.svg?react';

import { ButtonLanding } from '../button';

export const LandingBody = () => {
  return (
    <Wrapper>
      <LogoWrapper>
        <LogoLanding />
      </LogoWrapper>
      <BottomWrapper>
        <TextMain>
          Your Universal <br />
          Gateway to <br />
          Multi-chain Liquidity
        </TextMain>
        <ButtonLanding text="Get started" filled={false} size={'large'} />
      </BottomWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  absolute w-full top-320 flex flex-col justify-center items-center gap-40 animate-[goingup_600ms_forwards_400ms]
`;
const LogoWrapper = tw.div`w-691 h-60 animate-[smaller_600ms_forwards_400ms]`;
const BottomWrapper = tw.div`w-full flex flex-col justify-center items-center gap-40 opacity-0 animate-[showup_600ms_forwards_400ms]`;
const TextMain = tw.div`w-800 text-center text-neutral-100 font-eb-80`;
