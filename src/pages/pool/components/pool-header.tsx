import { useParams } from 'react-router-dom';
import tw from 'twin.macro';

import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { IconLink } from '~/assets/icons';

import { SCANNER_URL } from '~/constants';

import { ButtonIconMedium } from '~/components/buttons/icon';
import { Token } from '~/components/token';

import { useNetwork } from '~/hooks/contexts/use-network';
import { getNetworkFull } from '~/utils';

export const PoolHeader = () => {
  const { network, id } = useParams();

  const { selectedNetwork, isFpass } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

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
    const url = `${SCANNER_URL[currentNetwork]}/address/${lpTokenAddress}?${
      isFpass ? 'tab=erc20_transfers' : ''
    }`;

    window.open(url);
  };

  return (
    <HeaderWrapper>
      <TitleWrapper>
        <BadgeWrapper style={{ width: (compositions?.length || 0) * 28 + 12 }}>
          {compositions?.map((token, idx) => {
            const { symbol, image } = token;
            return (
              <Badge key={symbol + idx} style={{ left: idx * 28 }}>
                <Image src={image} />
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
            percentage={composition.weight}
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
  flex flex-col gap-12 gap-12
`;
const TitleWrapper = tw.div`flex inline-flex gap-16`;
const BadgeWrapper = tw.div`
  flex inline-flex items-center relative h-40
`;
const Badge = tw.div`
  w-40 h-40 absolute flex-center
`;
const Image = tw.img`
  w-40 h-40 object-cover flex-center
`;

const Title = tw.div`
  right-0 font-b-28 text-neutral-100
`;
const TokenWrapper = tw.div`
  flex gap-8 items-center
`;