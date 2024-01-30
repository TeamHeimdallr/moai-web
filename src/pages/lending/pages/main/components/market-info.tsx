import tw from 'twin.macro';

import { ASSET_URL } from '~/constants';

import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { useNetwork } from '~/hooks/contexts/use-network';
import { getNetworkAbbr } from '~/utils';
import { NETWORK } from '~/types';

export const MarketInfo = () => {
  const { ref } = useGAInView({ name: 'lending-main-info' });

  const { selectedNetwork } = useNetwork();
  const networkAbbr = getNetworkAbbr(selectedNetwork);
  const backgroundUrl = `${ASSET_URL}/images/network-${networkAbbr}.png`;

  const titleMap = {
    [NETWORK.THE_ROOT_NETWORK]: 'The Root Network',
    [NETWORK.XRPL]: 'XRPL',
    [NETWORK.EVM_SIDECHAIN]: 'Evm Sidechain',
  };

  return (
    <Wrapper ref={ref}>
      <HeaderWrapper>
        <LogoWrapper style={{ backgroundImage: `url(${backgroundUrl})` }} />
        <Title>{`${titleMap[selectedNetwork]} Market`}</Title>
      </HeaderWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
`;

const HeaderWrapper = tw.div`
  flex items-center gap-16
`;

const LogoWrapper = tw.div`
  w-40 h-40 bg-center bg-no-repeat bg-cover
`;

const Title = tw.div`
  font-b-24 text-neutral-100
`;
