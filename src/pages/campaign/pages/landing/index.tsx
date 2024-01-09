import { useEffect } from 'react';
import tw from 'twin.macro';

import { useCampaignRootBalance } from '~/api/api-contract/_evm/campaign/root-balance';

import { IS_MAINNET } from '~/constants';

import { Footer } from '~/components/footer';

import { Gnb } from '~/pages/campaign/components/gnb';

import { useGAPage } from '~/hooks/analaystics/ga-page';
import { useGAScroll } from '~/hooks/analaystics/ga-scroll';
import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { NETWORK, POPUP_ID } from '~/types';

import { LayoutDescription } from './layouts/layout-description';
import { LayoutDisclaimer } from './layouts/layout-disclaimer';
import { LayoutMain } from './layouts/layout-main';
import { LayoutPartner } from './layouts/layout-partner';
import { LayoutVoyage } from './layouts/layout-voyage';

const LandingPage = () => {
  useGAPage();
  useGAScroll();

  const { balance } = useCampaignRootBalance();

  const { selectNetwork } = useNetwork();
  const { open, close } = usePopup(POPUP_ID.LACK_OF_ROOT);
  const criteria = IS_MAINNET ? balance < 1000 : balance < 10;

  useEffect(() => {
    if (criteria) open();
    else close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criteria]);

  useEffect(() => {
    selectNetwork(NETWORK.THE_ROOT_NETWORK);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
