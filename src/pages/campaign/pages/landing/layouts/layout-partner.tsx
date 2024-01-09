import tw from 'twin.macro';

import { IconFuturepass } from '~/assets/icons';
import LogoFutureverse from '~/assets/logos/logo-futureverse.svg?react';

import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { useMediaQuery } from '~/hooks/utils';

export const LayoutPartner = () => {
  const { ref } = useGAInView({ name: 'campaign-layout-partner' });

  const { isMD } = useMediaQuery();

  return (
    <Wrapper ref={ref}>
      <Text>In collaboration with</Text>
      <LogoWrapper>
        <IconFuturepass width={isMD ? 80 : 48} />
        <LogoFutureverse width={isMD ? 276 : 165} />
      </LogoWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  relative w-full h-full flex flex-col gap-8 flex-center bg-[#0A0C13]
  py-119
  md:(py-262 )
`;
const Text = tw.div`
  font-b-18 text-neutral-60 
  md:(font-b-20)
`;
const LogoWrapper = tw.div`
  flex gap-8 flex-center
`;
