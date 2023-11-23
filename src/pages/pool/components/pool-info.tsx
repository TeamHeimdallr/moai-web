import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import tw from 'twin.macro';

import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { formatNumber } from '~/utils';

export const PoolInfo = () => {
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
  const { value, volume, apr, trandingFees } = pool || {};

  const formattedValue = value ? `$${formatNumber(value, 2)}` : '$0';
  const formattedVolume = volume ? `$${formatNumber(volume, 2)}` : '$0';
  const formattedApr = apr ? `${apr}%` : '0%';
  const formattedFees = trandingFees ? `${trandingFees * 100}%` : '0%';

  return (
    <Wrapper>
      <InnerWrapper>
        <PoolInfoCard name={t('Pool Value')} value={formattedValue} />
        <PoolInfoCard name={t('Volume (24h)')} value={formattedVolume} />
      </InnerWrapper>
      <InnerWrapper>
        <PoolInfoCard name={t('APR')} value={formattedApr} />
        <PoolInfoCard name={t('Trading Fee')} value={formattedFees} />
      </InnerWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex gap-16 flex-col
  md:(flex-row)
`;
const InnerWrapper = tw.div`
  flex flex-1 gap-16
`;

interface PoolInfoCardProps {
  name: string;
  value: string;
}
const PoolInfoCard = ({ name, value }: PoolInfoCardProps) => {
  return (
    <PoolInfoCardWrapper>
      <Name>{name}</Name>
      <Value>{value}</Value>
    </PoolInfoCardWrapper>
  );
};
const PoolInfoCardWrapper = tw.div`
  w-full flex flex-1 flex-col bg-neutral-10 rounded-12
  py-16 px-20 gap-12
  md:(py-20 px-24 gap-16)
`;
const Name = tw.div`
  font-m-14 text-neutral-80
  md:(font-m-16)
`;
const Value = tw.div`
  font-m-18 text-neutral-100
  md:(font-m-20)
`;
