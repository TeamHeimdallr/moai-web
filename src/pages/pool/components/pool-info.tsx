import { useParams } from 'react-router-dom';
import tw from 'twin.macro';

import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { formatNumber } from '~/utils';

export const PoolInfo = () => {
  const { network, id } = useParams();

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
    <PoolValueContainer>
      <PoolInfoCard name="Pool Value" value={formattedValue} />
      <PoolInfoCard name="Volume (24h)" value={formattedVolume} />
      <PoolInfoCard name="APR" value={formattedApr} />
      <PoolInfoCard name="Trading Fee" value={formattedFees} />
    </PoolValueContainer>
  );
};

const PoolValueContainer = tw.div`flex gap-16`;

interface PoolInfoCardProps {
  name: string;
  value: string;
}
const PoolInfoCard = ({ name, value }: PoolInfoCardProps) => {
  return (
    <Wrapper>
      <Name>{name}</Name>
      <Value>{value}</Value>
    </Wrapper>
  );
};
const Wrapper = tw.div`
  w-full flex flex-col bg-neutral-10 rounded-12 py-20 px-24 gap-16
`;
const Name = tw.div`
  font-m-14 text-neutral-80
`;
const Value = tw.div`
  font-m-20 text-neutral-100
`;
