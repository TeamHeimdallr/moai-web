import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useParams } from 'react-router-dom';
import tw from 'twin.macro';

import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { IconLink } from '~/assets/icons';

import { ASSET_URL, SCANNER_URL } from '~/constants';

import { ButtonIconMedium } from '~/components/buttons/icon';
import { Token } from '~/components/token';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { useNetwork } from '~/hooks/contexts/use-network';
import { formatNumber, getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';

export const PoolHeader = () => {
  const { ref } = useGAInView({ name: 'pool-detail-header' });
  const { gaAction } = useGAAction();
  const { network, id } = useParams();

  const { selectedNetwork, isXrp } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const isRoot = currentNetwork === NETWORK.THE_ROOT_NETWORK;

  const queryEnabled = !!network && !!id;
  const { data } = useGetPoolQuery(
    {
      params: {
        networkAbbr: network as string,
        poolId: id as string,
      },
    },
    {
      enabled: queryEnabled,
      staleTime: 1000,
    }
  );

  const { pool } = data || {};
  const { lpToken, compositions } = pool || {};
  const { address: lpTokenAddress } = lpToken || {};

  const handleLink = () => {
    const url = `${SCANNER_URL[currentNetwork]}/${
      isXrp ? 'accounts' : isRoot ? 'addresses' : 'token'
    }/${lpTokenAddress}`;

    gaAction({
      action: 'pool-detail-header-click',
      data: { page: 'pool-detail', component: 'pool-header', linkTo: url },
    });

    window.open(url);
  };

  return (
    <HeaderWrapper ref={ref}>
      <TitleWrapper>
        <BadgeWrapper style={{ width: (compositions?.length || 0) * 28 + 12 }}>
          {compositions?.map((token, idx) => {
            const { symbol, image } = token;
            return (
              <Badge key={symbol + idx} style={{ left: idx * 28 }}>
                <Image src={image || `${ASSET_URL}/tokens/token-unknown.png`} />
              </Badge>
            );
          })}
        </BadgeWrapper>
        <Title>{`${compositions
          ?.reduce((acc, cur) => `${acc}/${cur.symbol}`, '')
          .substring(1)}`}</Title>
      </TitleWrapper>

      <TokenWrapper>
        {compositions?.map((composition, i) => (
          <Token
            key={`${composition.symbol}-${i}`}
            token={composition.symbol}
            percentage={Number(formatNumber(composition.weight, 2))}
            image
            imageUrl={composition.image}
            type="small"
          />
        ))}
        <ButtonIconMedium icon={<IconLink />} onClick={handleLink} />
      </TokenWrapper>
    </HeaderWrapper>
  );
};

const HeaderWrapper = tw.div`
  flex flex-col gap-16 px-20
  md:(px-0)
`;
const TitleWrapper = tw.div`
  flex inline-flex gap-16 items-center
`;
const BadgeWrapper = tw.div`
  flex inline-flex items-center relative h-40
`;
const Badge = tw.div`
  w-40 h-40 absolute flex-center
`;
const Image = tw(LazyLoadImage)`
  w-40 h-40 object-cover flex-center
`;

const Title = tw.div`
  right-0 font-b-20 text-neutral-100
  md:(font-b-28)
`;
const TokenWrapper = tw.div`
  flex gap-8 items-center
`;
