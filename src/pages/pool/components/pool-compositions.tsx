import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import tw from 'twin.macro';

import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { useGAInView } from '~/hooks/analaystics/ga-in-view';

import { PoolCompositionsChart } from './pool-compositions-chart';
import { TokenCompositionLabel } from './pool-compositions-label';

export const PoolCompositions = () => {
  const { ref } = useGAInView({ name: 'pool-detail-composition' });

  const { network, id } = useParams();
  const { t } = useTranslation();

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
  const { poolId, compositions } = pool || {};

  return (
    <Wrapper ref={ref}>
      <Title>{t('Pool composition')}</Title>
      {compositions && (
        <ContentsWrapper>
          <ContentInnerWrapper>
            <TokenCompositionLabel composition={compositions[0]} idx={0} />
            <TokenCompositionLabel composition={compositions[1]} idx={1} />
          </ContentInnerWrapper>
          <GraphWrapper>
            <PoolCompositionsChart data={compositions} poolId={poolId} />
          </GraphWrapper>
        </ContentsWrapper>
      )}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-40 bg-neutral-10 rounded-12
  px-20 pt-16 pb-36 min-h-378
  md:(px-24 pt-20 pb-40 min-h-318)
`;

const ContentsWrapper = tw.div`
  flex flex-col items-center justify-between relative gap-40
  md:(flex-row flex-center justify-between w-full h-full gap-0)
`;

const ContentInnerWrapper = tw.div`
  w-full flex justify-between gap-4 flex-wrap
`;

const GraphWrapper = tw.div`
  h-144 flex-center overflow-hidden -order-1
  md:(h-190 absolute bottom-0)
`;

const Title = tw.div`
  font-b-18 text-primary-60
  md:(font-b-20)
`;
