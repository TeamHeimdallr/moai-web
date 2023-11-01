import { useState } from 'react';
import tw, { css, styled } from 'twin.macro';

import { IconDown } from '~/assets/icons';

import { ButtonIconLarge } from '~/components/buttons';
import { Table } from '~/components/tables';

import { useTableSwapHistories } from '~/pages/pool/hooks/components/table/use-table-swap-histories';

import { IPool } from '~/types';

interface Props {
  pool: IPool;
}
export const PoolSwapHistories = ({ pool }: Props) => {
  const [opened, open] = useState(false);
  const { data, columns } = useTableSwapHistories(pool.id);

  return (
    <Wrapper opened={opened}>
      <TitleWrapper>
        <Title>Swaps</Title>
        <Icon opened={opened} onClick={() => open(prev => !prev)}>
          <ButtonIconLarge icon={<IconDown />} />
        </Icon>
      </TitleWrapper>
      {opened && <Table data={data} columns={columns} ratio={[2, 3, 2, 2]} type="lighter" />}
    </Wrapper>
  );
};

interface DivProps {
  opened?: boolean;
}
const Wrapper = styled.div<DivProps>(({ opened }) => [
  opened ? tw`pb-24` : tw`pb-20`,
  tw`flex flex-col gap-24 bg-neutral-10 rounded-12 px-24`,
]);
const TitleWrapper = tw.div`flex justify-between items-center pt-20`;
const Title = tw.div`
  font-b-20 text-neutral-100
`;

const Icon = styled.div<DivProps>(({ opened }) => [
  tw`p-2 transition-transform flex-center clickable`,
  css`
    transform: rotate(${opened ? '-180deg' : '0deg'});
  `,
]);
