import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import tw from 'twin.macro';

import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { PoolCompositionsChart } from './pool-compositions-chart';
import { TokenCompositionLabel } from './pool-compositions-label';

export const PoolCompositions = () => {
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
  const { compositions } = pool || {};

  return (
    <Wrapper>
      <Title>{t('Pool composition')}</Title>
      {compositions && (
        <ContentsWrapper>
          <TokenCompositionLabel composition={compositions[0]} idx={0} />
          <GraphWrapper>
            <PoolCompositionsChart data={compositions} />
          </GraphWrapper>
          <TokenCompositionLabel composition={compositions[1]} idx={1} />
        </ContentsWrapper>
      )}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-24 bg-neutral-10 rounded-12 px-24 pt-20 pb-40 min-h-318
`;

const ContentsWrapper = tw.div`
  flex items-center justify-between
`;

const GraphWrapper = tw.div`
  h-190 flex-center overflow-hidden
`;

const Title = tw.div`
  font-b-20 text-primary-60
`;
