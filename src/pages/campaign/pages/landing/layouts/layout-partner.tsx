import tw from 'twin.macro';

import { IconFuturepass } from '~/assets/icons';

import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { useMediaQuery } from '~/hooks/utils';

export const LayoutPartner = () => {
  const { ref } = useGAInView({ name: 'campaign-layout-partner' });

  const { isMD } = useMediaQuery();

  return (
    <Wrapper ref={ref}>
      <Text>In collaboration with</Text>
      <LogoWrapper>
        <IconFuturepass width={isMD ? 80 : 48} height={isMD ? 80 : 48} />
      </LogoWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  relative w-full h-full flex gap-8 flex-center bg-[#0A0C13]
  py-119
  md:(py-262)
`;
const Text = tw.div`
  font-b-18 text-neutral-60 
  md:(font-b-20)
`;
const LogoWrapper = tw.div`
  flex gap-8 flex-center w-48 h-48 overflow-hidden
  md:(w-80 h-80)
`;
