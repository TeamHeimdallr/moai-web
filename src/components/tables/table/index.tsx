import type { ColumnDef } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Fragment, ReactNode } from 'react';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconDown } from '~/assets/icons';

interface ReactTableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T, ReactNode>[];

  emptyText?: string;
  hasMore?: boolean;
  isLoading?: boolean;

  handleMoreClick?: () => void;
  handleRowClick?: (id: string) => void;
}

export const Table = <T extends object>({
  data,
  columns,

  emptyText,
  hasMore,
  isLoading,

  handleMoreClick,
  handleRowClick,
}: ReactTableProps<T>) => {
  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility: { id: false },
    },
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <StyledTable>
      <Header>
        {table.getHeaderGroups().map(headerGroup => (
          <HeaderInnerWrapper key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <Fragment key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </Fragment>
            ))}
          </HeaderInnerWrapper>
        ))}
      </Header>
      <Divider />
      {table.getRowModel().rows.length === 0 ? (
        <EmptyText>{emptyText ?? 'Empty table'}</EmptyText>
      ) : (
        <Body>
          {table.getRowModel().rows.map(row => (
            <BodyInnerWrapper
              key={row.id}
              rounded={!hasMore && !isLoading}
              onClick={() => handleRowClick?.(row.getValue('id'))}
            >
              {row.getVisibleCells().map(cell => (
                <Fragment key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Fragment>
              ))}
            </BodyInnerWrapper>
          ))}
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

const StyledTable = tw.div`
  w-full bg-neutral-10 rounded-10 flex flex-col
`;

const Header = tw.div`
  flex gap-16 px-24 py-20 items-center font-m-16 text-neutral-80
`;

const Body = tw.div`
  flex flex-col items-center font-r-16 text-neutral-100
`;

const HeaderInnerWrapper = tw.div`
  flex w-full h-full gap-16
`;

interface BTRProps {
  rounded?: boolean;
}
const BodyInnerWrapper = styled.div<BTRProps>(({ rounded }) => [
  tw`
    flex w-full h-full px-24 py-20 clickable gap-16
    hover:(bg-neutral-15)
  `,
  rounded && tw`last:(rounded-b-10)`,
]);

const Divider = tw.div`
  w-full h-1 flex-shrink-0 bg-neutral-15
`;

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
