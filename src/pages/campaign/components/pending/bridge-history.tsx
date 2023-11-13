import { Fragment, useMemo } from 'react';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconDown } from '~/assets/icons';

import { TableColumnAmount } from '../table/table-column-amount';
import { TableColumnTime } from '../table/table-column-time';

export const BridgeHistory = () => {
  const hasMore = false;
  const isLoading = false;

  // TODO : connect API
  const data = [
    {
      id: 1,
      amount: <TableColumnAmount balance={100} value={100} />,
      time: <TableColumnTime time={1699624454446} />,
      hash: '0x1234',
    },
    {
      id: 2,
      amount: <TableColumnAmount balance={23} value={100} />,
      time: <TableColumnTime time={1699624454446} />,
      hash: '0x1234',
    },
  ];
  const columns = useMemo(
    () => [
      { accessorKey: 'id' },
      {
        cell: row => row.renderValue(),
        accessorKey: 'amount',
      },
      {
        cell: row => row.renderValue(),
        accessorKey: 'time',
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility: { id: false },
    },
    getCoreRowModel: getCoreRowModel(),
  });

  const tableRatio = [14, 5].map(num => `${num}fr`).join(' ');
  const handleRowClick = (link: string) => {
    window.open(link);
  };
  const handleMoreClick = () => {};

  return (
    <StyledTable>
      {table.getRowModel().rows.length === 0 ? (
        <EmptyText>{'No result'}</EmptyText>
      ) : (
        <Body>
          {table.getRowModel().rows.map(
            (row, i) =>
              row && (
                <BodyInnerWrapper
                  key={row.id + i}
                  ratio={tableRatio}
                  rounded={!hasMore && !isLoading}
                  onClick={() => {
                    handleRowClick?.(data[i].hash);
                  }}
                >
                  {row.getVisibleCells().map((cell, i) => (
                    <Fragment key={cell.id + i}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Fragment>
                  ))}
                </BodyInnerWrapper>
              )
          )}
          {hasMore && (
            <More onClick={handleMoreClick}>
              Load more <IconDown />
            </More>
          )}
          {isLoading && <Loading>Loading...</Loading>}
        </Body>
      )}
    </StyledTable>
  );
};

const StyledTable = styled.div(() => [tw`w-full bg-neutral-15 rounded-12 flex flex-col`]);

const Body = tw.div`
  flex flex-col items-center font-r-16 text-neutral-100 
`;

interface BTRProps {
  rounded?: boolean;
  ratio: string;
}
const BodyInnerWrapper = styled.div<BTRProps>(({ rounded, ratio }) => [
  tw`
    grid items-center w-full h-full px-24 py-20 gap-32 hover:bg-neutral-15
  `,
  rounded && tw`last:(rounded-b-10)`,
  css`
    & {
      grid-template-columns: ${ratio};
    }
  `,
]);
const More = styled.div(() => [
  tw`
    w-full h-72 flex-center gap-6 font-m-14 text-neutral-60 clickable rounded-b-10
    hover:(bg-neutral-15 text-primary-80)
  `,
  css`
    & svg {
      fill: ${COLOR.NEUTRAL[60]};
      width: 20px;
      height: 20px;
    }

    &:hover {
      svg {
        fill: ${COLOR.PRIMARY[80]};
      }
    }
  `,
]);

const Loading = tw.div`
  w-full h-72 flex-center gap-6 font-m-14 text-primary-80 bg-neutral-15 rounded-b-10
`;

const EmptyText = tw.div`
  w-full px-24 py-48 flex-center font-r-16 text-neutral-60
`;
