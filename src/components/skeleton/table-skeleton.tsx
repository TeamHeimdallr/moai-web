import { Fragment, ReactNode } from 'react';
import Skeleton from 'react-loading-skeleton';
import type { ColumnDef } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import tw, { css, styled } from 'twin.macro';

interface ReactTableProps<T extends object> {
  columns: ColumnDef<T, ReactNode>[];
  ratio: number[];
  type?: 'darker' | 'lighter';
  skeletonHeight?: number;
}

export const TableSkeleton = <T extends object>({
  columns,
  ratio,
  type,
  skeletonHeight = 240,
}: ReactTableProps<T>) => {
  const table = useReactTable({
    data: [],
    columns,
    state: {
      columnVisibility: { id: false, meta: false },
    },
    getCoreRowModel: getCoreRowModel(),
  });

  const tableRatio = ratio.map(num => `minmax(0, ${num}fr)`).join(' ');

  return (
    <StyledTable type={type}>
      <Header>
        {table.getHeaderGroups().map((headerGroup, i) => (
          <HeaderInnerWrapper key={headerGroup.id + i} ratio={tableRatio}>
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
      <Divider type={type} />
      <Skeleton
        height={skeletonHeight}
        highlightColor="#2B2E44"
        baseColor="#23263A"
        duration={0.9}
        style={{ borderRadius: '0 0 12px 12px' }}
      />
    </StyledTable>
  );
};

interface TableProps {
  ratio?: string;
  type?: 'darker' | 'lighter';
}
const StyledTable = styled.div<TableProps>(({ type }) => [
  tw`w-full bg-neutral-10 rounded-12 flex flex-col`,
  type === 'lighter' && tw`bg-neutral-15`,
]);
const Header = tw.div`
  px-24 py-20 items-center font-m-16 text-neutral-80
`;

const HeaderInnerWrapper = styled.div<TableProps>(({ ratio }) => [
  tw`grid w-full h-full gap-16`,
  css`
    & {
      grid-template-columns: ${ratio};
    }
  `,
]);

interface DividerProps {
  type?: 'darker' | 'lighter';
}
const Divider = styled.div<DividerProps>(({ type }) => [
  tw`w-full h-1 flex-shrink-0 bg-neutral-15`,
  type === 'lighter' && tw`bg-neutral-20`,
]);
