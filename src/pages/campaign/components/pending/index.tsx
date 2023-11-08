import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import tw, { css, styled } from 'twin.macro';

import { IconDown } from '~/assets/icons';

import { ButtonIconLarge } from '~/components/buttons';
import { Table, TableHeader, TableHeaderSortable } from '~/components/tables';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';

import { useTablePendingStore } from '../../states/sort';

export const Pending = () => {
  const { selectedNetwork } = useNetwork();
  const { network } = useParams();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const { sort, setSort } = useTablePendingStore();

  const { currentAddress } = useConnectedWallet(currentNetwork);

  const [opened, open] = useState(false);

  const data = [{ id: 0, step: 4 }];
  const columns = useMemo(
    () => [
      { accessorKey: 'id' },
      {
        header: () => <TableHeader label="Step" align="flex-start" />,
        cell: row => row.renderValue(),
        accessorKey: 'step',
      },
      {
        header: () => <TableHeader label="Value" align="flex-end" />,
        cell: row => row.renderValue(),
        accessorKey: 'value',
      },
      {
        header: () => (
          <TableHeaderSortable sortKey="TIME" label="Time" sort={sort} setSort={setSort} />
        ),
        cell: row => row.renderValue(),
        accessorKey: 'time',
      },
      {
        header: () => <TableHeader label="" align="flex-end" />,
        cell: row => row.renderValue(),
        accessorKey: 'continue',
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Wrapper opened={opened}>
      <TitleWrapper>
        <Title>Pending</Title>
        <Icon opened={opened} onClick={() => open(prev => !prev)}>
          <ButtonIconLarge icon={<IconDown />} />
        </Icon>
      </TitleWrapper>
      {opened && (
        <>
          <Table data={data} columns={columns} ratio={[3, 3, 3, 1]} type="lighter" />
        </>
      )}
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
const TitleWrapper = tw.div`flex justify-between pt-20 items-center`;
const Title = tw.div`
  font-b-20 text-neutral-100
`;

const Icon = styled.div<DivProps>(({ opened }) => [
  tw`p-2 transition-transform flex-center clickable`,
  css`
    transform: rotate(${opened ? '-180deg' : '0deg'});
  `,
]);
