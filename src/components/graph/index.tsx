import tw from 'twin.macro';

import { useDoughnutGraph } from '~/hooks/data/use-doughnut-graph';
import { formatNumberWithUnit } from '~/utils/number';

import { PoolCompositionData } from '~/moai-xrp-ledger/types/components';

interface Props {
  data: Omit<PoolCompositionData, 'tokenIssuer'>[];
}
const Graph = ({ data }: Props) => {
  const totalValue = data.reduce((acc, cur) => acc + cur.value, 0);

  useDoughnutGraph({ data });

  return (
    <Wrapper>
      <Canvas id="graph" />
      <TotalValue>
        <Amount>${formatNumberWithUnit(totalValue)}</Amount>
        <Title>Pool Value</Title>
      </TotalValue>
    </Wrapper>
  );
};

export default Graph;

const Wrapper = tw.div`w-380 h-380 relative flex items-end justify-center`;
const Canvas = tw.canvas`z-1 absolute`;
const TotalValue = tw.div`flex-center flex-col gap-2`;
const Amount = tw.div`font-b-28 text-neutral-100`;
const Title = tw.div`font-m-16 text-neutral-80 pb-120`;
