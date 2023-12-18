import tw from 'twin.macro';

import { Footer } from '~/components/footer';

import { Gnb } from '../../components/gnb';
import { Description } from '../description';
import Disclaimer from '../disclaimer';
import { Futureverse } from '../futureverse';

import { ContentSkeleton } from './content-skeleton';
import { MyVoyageSkeleton } from './my-voyage-skeleton';

export const LandingSkeleton = () => {
  return (
    <Wrapper>
      <GnbWrapper>
        <Gnb />
      </GnbWrapper>
      <ContentSkeleton />

      <MyVoyageSkeleton />
      <Futureverse />
      <Description />
      <FooterWrappper>
        <Disclaimer />
        <Footer />
      </FooterWrappper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  relative w-full h-full flex flex-col justify-between bg-neutral-5
`;
const GnbWrapper = tw.div`w-full absolute top-0 left-0 flex-center flex-col z-10`;
const FooterWrappper = tw.div`w-full bg-neutral-10`;
