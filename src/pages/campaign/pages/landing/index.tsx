import tw from 'twin.macro';

import { Footer } from '~/components/footer';

import { Gnb } from '~/pages/campaign/components/gnb';

import { LayoutDescription } from './layouts/layout-description';
import { LayoutDisclaimer } from './layouts/layout-disclaimer';
import { LayoutMain } from './layouts/layout-main';
import { LayoutPartner } from './layouts/layout-partner';
import { LayoutVoyage } from './layouts/layout-voyage';

const LandingPage = () => {
  return (
    <Wrapper>
      <GnbWrapper>
        <Gnb />
      </GnbWrapper>

      <LayoutMain />
      <LayoutVoyage />
      <LayoutPartner />
      <LayoutDescription />

      <FooterWrappper>
        <LayoutDisclaimer />
        <Footer />
      </FooterWrappper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  relative w-full h-full flex flex-col justify-between bg-neutral-5
`;
const GnbWrapper = tw.div`
  w-full absolute top-0 left-0 flex-center flex-col z-10
`;
const FooterWrappper = tw.div`
  w-full bg-neutral-10
`;

export default LandingPage;
