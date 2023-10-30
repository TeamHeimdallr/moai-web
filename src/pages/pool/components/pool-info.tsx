import tw from 'twin.macro';

interface Props {
  value: string;
  volume: string;
  apr: string;
  fees: string;
}
export const PoolInfo = ({ value, volume, apr, fees }: Props) => {
  return (
    <PoolValueContainer>
      <PoolInfoCard name="Pool Value" value={value} />
      <PoolInfoCard name="Volume (24h)" value={volume} />
      <PoolInfoCard name="APR" value={apr} />
      <PoolInfoCard name="Trading Fee" value={fees} />
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
  w-198 flex flex-col bg-neutral-10 rounded-12 py-20 px-24 gap-16
`;
const Name = tw.div`
  font-m-14 text-neutral-80
`;
const Value = tw.div`
  font-m-20 text-neutral-100
`;
