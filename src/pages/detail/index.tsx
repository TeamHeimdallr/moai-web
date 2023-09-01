import { useNavigate, useParams } from 'react-router-dom';
import tw from 'twin.macro';

import { IconLink } from '~/assets/icons';
import { ButtonIconMedium } from '~/components/buttons/icon';
import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';
import { Token } from '~/components/token';
import { pools } from '~/data';
import { useRequirePrarams } from '~/hooks/pages/use-require-params';

import { PoolInfoCard } from './components/pool-info-card';

const DetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useRequirePrarams([id], () => navigate(-1));

  const { compositions, value, volume, apy, fees } = pools[Number(id) - 1];

  return (
    <Wrapper>
      <GnbWrapper>
        <Gnb />
      </GnbWrapper>
      <InnerWrapper>
        <HeaderWrapper>
          <Title>Weighted Pool</Title>
          <TokenWrapper>
            {compositions.map(token => (
              <Token key={token.name} token={token.name} percentage={token.weight} type="small" />
            ))}
            <ButtonIconMedium icon={<IconLink />} />
          </TokenWrapper>
          <Text>
            Dynamic swap fees : Currently <Fee>{` 0.3 `}</Fee>%
          </Text>
        </HeaderWrapper>

        <ContentWrapper>
          <PoolInfo>
            <PoolValueContainer>
              <PoolInfoCard name="Pool Value" value={value} />
              <PoolInfoCard name="Volume (24h)" value={volume} />
              <PoolInfoCard name="Fees (24h)" value={fees} />
              <PoolInfoCard name="APY" value={apy} />
            </PoolValueContainer>
          </PoolInfo>
        </ContentWrapper>
      </InnerWrapper>
      <Footer />
    </Wrapper>
  );
};

const Wrapper = tw.div`relative flex flex-col justify-between w-full h-full`;
const GnbWrapper = tw.div`w-full h-80 absolute top-0 left-0 flex-center`;
const InnerWrapper = tw.div`
  flex flex-col pb-120 pt-80 px-96
`;
const HeaderWrapper = tw.div`flex flex-col gap-12 gap-12 py-40`;
const Title = tw.div`font-b-28 text-neutral-100`;
const TokenWrapper = tw.div`flex gap-8 items-center`;
const Fee = tw.div`font-m-14`;
const Text = tw.div`font-r-14 text-neutral-60 inline-flex whitespace-pre`;

const ContentWrapper = tw.div`flex`;
const PoolInfo = tw.div``;
const PoolValueContainer = tw.div`flex gap-16`;
export default DetailPage;
