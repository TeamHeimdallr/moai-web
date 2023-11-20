import { useTranslation } from 'react-i18next';
import tw from 'twin.macro';

import { useDoughnutGraph } from '~/hooks/components/use-graph-semi-donut';
import { formatNumber } from '~/utils';
import { ITokenComposition } from '~/types';

interface Props {
  data: ITokenComposition[];
}
export const GraphSemiDonut = ({ data }: Props) => {
  const { t } = useTranslation();

  const totalValue = data.reduce((acc, cur) => acc + (cur?.value ?? 0), 0);
  useDoughnutGraph({ data });

  return (
    <Wrapper>
      <Canvas id="moai-pool--doughnut-graph" />
      <TotalValue>
        <Amount>${formatNumber(totalValue, 4)}</Amount>
        <Title>{t('Pool Value')}</Title>
      </TotalValue>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-380 h-380 relative flex items-end justify-center
`;
const Canvas = tw.canvas`
  z-1 absolute
`;
const TotalValue = tw.div`
  flex-center flex-col gap-2
`;
const Amount = tw.div`
  font-b-28 text-neutral-100
`;
const Title = tw.div`
  font-m-16 text-neutral-80 pb-120
`;
