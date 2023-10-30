import { Fragment, ReactNode } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconDown } from '~/assets/icons';

interface ReactTableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T, ReactNode>[];

  emptyText?: string;
  hasMore?: boolean;
  isLoading?: boolean;
  type: 'poolWithChain' | 'poolWithoutChain' | 'provision' | 'swap';

  handleMoreClick?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleRowClick?: (meta: any) => void;
}

export const Table = <T extends object>({
  data = [],
  columns,

  emptyText,
  hasMore,
  isLoading,

  type,

  handleMoreClick,
  handleRowClick,
}: ReactTableProps<T>) => {
  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility: { id: false, meta: false },
    },
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <StyledTable type={type}>
      <Header>
        {table.getHeaderGroups().map((headerGroup, i) => (
          <HeaderInnerWrapper key={headerGroup.id + i} type={type}>
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
          {table.getRowModel().rows.map(
            (row, i) =>
              row && (
                <BodyInnerWrapper
                  key={row.id + i}
                  type={type}
                  rounded={!hasMore && !isLoading}
                  onClick={() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    handleRowClick?.(row.getValue('meta'));
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

interface TypeProps {
  type?: 'poolWithChain' | 'poolWithoutChain' | 'provision' | 'swap';
}
const StyledTable = styled.div<TypeProps>(({ type }) => [
  tw`w-full bg-neutral-10 rounded-12 flex flex-col`,
  (type === 'provision' || type === 'swap') && tw`bg-neutral-15`,
]);
const Header = tw.div`
  px-24 py-20 items-center font-m-16 text-neutral-80
`;

const Body = tw.div`
  flex flex-col items-center font-r-16 text-neutral-100 
`;

const HeaderInnerWrapper = styled.div<TypeProps>(({ type }) => [
  tw`grid w-full h-full gap-16`,
  type === 'poolWithChain'
    ? tw`grid-cols-[2fr 1fr 1fr 1fr 1fr]`
    : type === 'poolWithoutChain'
    ? tw`grid-cols-[2fr 1fr 1fr 1fr]`
    : tw`grid-cols-[2fr 3fr 2fr 2fr]`,
]);

interface BTRProps {
  rounded?: boolean;
  type?: 'poolWithChain' | 'poolWithoutChain' | 'provision' | 'swap';
}
const BodyInnerWrapper = styled.div<BTRProps>(({ rounded, type }) => [
  tw`
    grid w-full h-full px-24 py-20 clickable gap-16 hover:bg-neutral-15
  `,
  rounded && tw`last:(rounded-b-10)`,
  type === 'poolWithChain'
    ? tw`grid-cols-[2fr 1fr 1fr 1fr 1fr]`
    : type === 'poolWithoutChain'
    ? tw`grid-cols-[2fr 1fr 1fr 1fr]`
    : tw`grid-cols-[2fr 3fr 2fr 2fr] hover:(bg-neutral-20)`,
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
