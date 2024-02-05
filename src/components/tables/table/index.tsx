import { Fragment, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Skeleton from 'react-loading-skeleton';
import type { ColumnDef } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconDown } from '~/assets/icons';

interface ReactTableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T, ReactNode>[];

  ratio: (number | string)[];
  minRatio?: (number | string)[];

  emptyText?: string;
  hasMore?: boolean;
  isLoading?: boolean;
  type?: 'darker' | 'lighter';

  skeletonHeight?: number;
  slim?: boolean;

  disableHover?: boolean;

  handleMoreClick?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleRowClick?: (meta: any) => void;
}

export const Table = <T extends object>({
  data = [],
  columns,

  ratio,

  emptyText,
  hasMore,
  isLoading,
  type,

  skeletonHeight,
  slim,

  disableHover,

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
  const { t } = useTranslation();

  const tableRatio = ratio
    .map(r => (typeof r === 'number' ? `minmax(0, ${r}fr)` : `minmax(0, ${r})`))
    .join(' ');

  return (
    <StyledTable type={type}>
      <Header>
        {table.getHeaderGroups().map((headerGroup, i) => (
          <HeaderInnerWrapper key={headerGroup.id + i} ratio={tableRatio} slim={slim}>
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
      {skeletonHeight ? (
        <Skeleton
          height={skeletonHeight}
          highlightColor="#2B2E44"
          baseColor="#23263A"
          duration={0.9}
          style={{ borderRadius: '0 0 12px 12px' }}
        />
      ) : table.getRowModel().rows.length === 0 ? (
        <EmptyText>{emptyText ?? 'No result'}</EmptyText>
      ) : (
        <Body>
          {table.getRowModel().rows.map(
            (row, i) =>
              row && (
                <BodyInnerWrapper
                  key={row.id + i}
                  ratio={tableRatio}
                  type={type}
                  slim={slim}
                  disableHover={disableHover}
                  rounded={!hasMore && !isLoading}
                  onClick={() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    handleRowClick?.(row.getValue('meta'));
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  className={(row.getValue('meta') as any)?.className}
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
              {t('Load more')}
              <IconDown width={20} height={20} />
            </More>
          )}
          {isLoading && <Loading>Loading...</Loading>}
        </Body>
      )}
    </StyledTable>
  );
};

interface TableProps {
  ratio?: string;
  type?: 'darker' | 'lighter';
  slim?: boolean;
}
const StyledTable = styled.div<TableProps>(({ type }) => [
  tw`w-full bg-neutral-10 rounded-12 flex flex-col`,
  type === 'lighter' && tw`bg-neutral-15`,
]);
const Header = tw.div`
  px-24 py-20 items-center font-m-16 text-neutral-80
`;

interface BodyProps {
  height?: number;
}
const Body = styled.div<BodyProps>(({ height }) => [
  tw`
    flex flex-col items-center font-r-16 text-neutral-100 
  `,
  height &&
    css`
      height: ${height}px;
    `,
]);

const HeaderInnerWrapper = styled.div<TableProps>(({ ratio, slim }) => [
  tw`grid w-full h-full gap-16`,
  css`
    & {
      grid-template-columns: ${ratio};
    }
  `,
  slim && tw`gap-8`,
]);

interface BTRProps {
  rounded?: boolean;
  ratio: string;
  type?: 'darker' | 'lighter';

  slim?: boolean;
  disableHover?: boolean;
}
const BodyInnerWrapper = styled.div<BTRProps>(({ rounded, ratio, type, slim, disableHover }) => [
  tw`
    grid w-full h-full px-24 py-20 gap-16
  `,
  rounded && tw`last:(rounded-b-10)`,
  slim && tw`gap-8`,
  !disableHover && (type === 'lighter' ? tw`hover:bg-neutral-17` : tw`hover:bg-neutral-15`),
  !disableHover && tw`clickable`,
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

const More = styled.div(() => [
  tw`
    w-full h-72 flex-center gap-6 font-m-14 text-neutral-60 clickable rounded-b-10
    px-24 py-25
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
