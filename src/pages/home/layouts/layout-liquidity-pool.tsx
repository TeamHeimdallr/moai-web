import tw from 'twin.macro';

import { IconNext } from '~/assets/icons';
import { ButtonPrimaryMediumIconTrailing } from '~/components/buttons/primary';
import { Table } from '~/components/tables';
import { useTableLiquidityPool } from '~/hooks/components/tables/use-table-liquidity-pool';
import { LiquidityPoolTable } from '~/types/components/tables';

export const LiquidityPoolLayout = () => {
  const { data, columns } = useTableLiquidityPool();

  return (
    <Wrapper>
      <TitleWrapper>
        <Title>Liquidity pools</Title>
        <ButtonPrimaryMediumIconTrailing text="Create a pool" icon={<IconNext />} disabled />
      </TitleWrapper>
      <Table<LiquidityPoolTable>
        data={data}
        columns={columns}
        emptyText="No liquidity pools on Mantle"
      />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-24
`;

const TitleWrapper = tw.div`
  h-40 flex gap-10 items-center w-full
`;

const Title = tw.div`
  font-b-24 text-neutral-100 flex-1
`;
