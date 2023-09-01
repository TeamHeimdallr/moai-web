import tw from 'twin.macro';
interface Props {
  name: string;
  value: string;
}
export const PoolInfoCard = ({ name, value }: Props) => {
  return (
    <Wrapper>
      <Name>{name}</Name>
      <Value>{value}</Value>
    </Wrapper>
  );
};
const Wrapper = tw.div`w-190 flex flex-col bg-neutral-10 rounded-12 py-20 px-24 gap-16`;
const Name = tw.div`font-m-14 text-neutral-80`;
const Value = tw.div`font-m-20 text-neutral-100`;
