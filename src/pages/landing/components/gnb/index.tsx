import tw from 'twin.macro';

import { ReactComponent as LogoText } from '~/assets/logos/logo-text.svg';

import { useMediaQuery } from '~/hooks/pages/use-media-query';

import { ButtonLanding } from '../button';

export const LandingGnb = () => {
  const { isMD } = useMediaQuery();
  return (
    <Wrapper>
      <LogoWrapper>
        <LogoText width={88} />
      </LogoWrapper>
      <ButtonLanding text="Get started" filled size={isMD ? 'large' : 'medium'} />
    </Wrapper>
  );
};

const Wrapper = tw.div`w-full h-80 flex justify-between items-center bg-transparent px-24 py-20`;
const LogoWrapper = tw.div``;
