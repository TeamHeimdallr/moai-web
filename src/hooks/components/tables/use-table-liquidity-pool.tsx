import { ColumnDef } from '@tanstack/react-table';
import { ReactNode, useMemo } from 'react';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconArrowDown, IconArrowUp, IconTokens } from '~/assets/icons';
import { BadgeNew } from '~/components/badges/new';
import { Token } from '~/components/token';
import { TOKEN, TOKEN_IMAGE_MAPPER } from '~/constants';
import { useTableLiquidityStore } from '~/states/components/table-liquidity-pool';
import { LiquidityPoolTable } from '~/types/components/tables';
import { formatNumber } from '~/utils/number';
import { sumPoolValues } from '~/utils/token';

export const useTableLiquidityPool = () => {
  const { sorting, setSorting } = useTableLiquidityStore();

  // TODO: fetch from contract api
  const data = [
    {
      assets: [TOKEN.MNT, TOKEN.DAI],
      composition: {
        [TOKEN.MNT]: 20,
        [TOKEN.DAI]: 80,
      },
      pool: {
        [TOKEN.MNT]: 1029000,
        [TOKEN.DAI]: 348008,
      } as Record<TOKEN, number>,
      volume: 639120,
      apr: 0.87,
      isNew: true,
    },
    {
      assets: [TOKEN.MOAI, TOKEN.MNT, TOKEN.USDC],
      composition: {
        [TOKEN.MOAI]: 30,
        [TOKEN.MNT]: 30,
        [TOKEN.USDC]: 40,
      },
      pool: {
        [TOKEN.MNT]: 102090,
        [TOKEN.DAI]: 34808,
        [TOKEN.USDC]: 23040,
      } as Record<TOKEN, number>,
      volume: 639120,
      apr: 0.87,
      isNew: false,
    },
  ].sort((a, b) => {
    if (sorting?.key === 'POOL_VALUE')
      return sorting.order === 'asc'
        ? sumPoolValues(a.pool) - sumPoolValues(b.pool)
        : sumPoolValues(b.pool) - sumPoolValues(a.pool);
    if (sorting?.key === 'POOL_VALUE')
      return sorting.order === 'asc' ? a.volume - b.volume : b.volume - a.volume;
    return 0;
  });

  const tableData = useMemo<LiquidityPoolTable[]>(
    () =>
      data.map(d => {
        const assets = (
          <AssetWrapper>
            {d.assets.map((asset, idx) => (
              <Asset
                key={asset}
                title={asset as string}
                src={TOKEN_IMAGE_MAPPER[asset]}
                idx={idx}
                total={d.assets.length}
              />
            ))}
          </AssetWrapper>
        );
        const composition = (
          <CompositionWrapper>
            {Object.entries(d.composition).map(([token, percentage]) => (
              <Token
                key={token}
                token={token as TOKEN}
                percentage={percentage}
                image={false}
                type="small"
              />
            ))}
            {d.isNew && <BadgeNew />}
          </CompositionWrapper>
        );
        const poolValue = sumPoolValues(d.pool);
        const formattedPoolValue = <Amount>${formatNumber(poolValue, 2)}</Amount>;
        const volumn = <Amount>${formatNumber(d.volume, 2)}</Amount>;
        const apr = <Amount>{d.apr}%</Amount>;

        return {
          assets,
          composition,
          poolValue: formattedPoolValue,
          volumn,
          apr,
        };
      }),
    [data]
  );

  const columns = useMemo<ColumnDef<LiquidityPoolTable, ReactNode>[]>(
    () => [
      {
        header: () => (
          <HeaderAsset>
            <IconTokens width={24} height={24} fill={COLOR.NEUTRAL[80]} />
            Assets
          </HeaderAsset>
        ),
        cell: row => row.renderValue(),
        accessorKey: 'assets',
      },
      {
        header: () => <HeaderComposition>Composition</HeaderComposition>,
        cell: row => row.renderValue(),
        accessorKey: 'composition',
      },
      {
        header: () => (
          <SelectableHeaderText
            selected={sorting?.key === 'POOL_VALUE'}
            onClick={() =>
              setSorting({ key: 'POOL_VALUE', order: sorting?.order === 'asc' ? 'desc' : 'asc' })
            }
          >
            Pool value
            {sorting?.key === 'POOL_VALUE' &&
              (sorting?.order === 'asc' ? (
                <IconArrowUp width={16} height={16} />
              ) : (
                <IconArrowDown width={16} height={16} />
              ))}
          </SelectableHeaderText>
        ),
        cell: row => row.renderValue(),
        accessorKey: 'poolValue',
      },
      {
        header: () => (
          <SelectableHeaderText
            selected={sorting?.key === 'VOLUMN'}
            onClick={() =>
              setSorting({ key: 'VOLUMN', order: sorting?.order === 'asc' ? 'desc' : 'asc' })
            }
          >
            {'Volume (24h)'}
            {sorting?.key === 'VOLUMN' &&
              (sorting?.order === 'asc' ? (
                <IconArrowUp width={16} height={16} />
              ) : (
                <IconArrowDown width={16} height={16} />
              ))}
          </SelectableHeaderText>
        ),
        cell: row => row.renderValue(),
        accessorKey: 'volumn',
      },
      {
        header: () => <HeaderText>APR</HeaderText>,
        cell: row => row.renderValue(),
        accessorKey: 'apr',
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sorting?.key, sorting?.order]
  );

  return {
    columns,
    data: tableData,
  };
};

const AssetWrapper = tw.div`
  relative w-120 flex-shrink-0
`;

interface AssetProps {
  idx: number;
  total: number;
}
const Asset = styled.img<AssetProps>(({ idx, total }) => [
  tw`absolute flex w-24 h-24 border-solid rounded-full border-1 border-neutral-0 top-4`,
  css`
    z-index: ${total - idx};
    left: ${idx * 20}px;
  `,
]);

const CompositionWrapper = tw.div`
  w-full flex gap-8 items-center flex-1 h-32
`;

const Amount = tw.div`
  font-r-16 text-neutral-100 w-160 flex-shrink-0 flex justify-end items-center
`;

const HeaderAsset = tw.div`
  w-120 flex gap-6 font-m-16 text-neutral-80 items-center justify-start
`;

const HeaderComposition = tw.div`
  w-full flex flex-1 font-m-16 text-neutral-80
`;

const HeaderText = styled.div(() => [
  tw`flex items-center justify-end gap-4 w-160 font-m-16 text-neutral-80`,
  css`
    & svg {
      fill: ${COLOR.NEUTRAL[80]};
    }
  `,
]);

interface SelectableHeaderPoolProps {
  selected?: boolean;
}
const SelectableHeaderText = styled.div<SelectableHeaderPoolProps>(({ selected }) => [
  tw`flex items-center justify-end gap-4 w-160 font-m-16 text-neutral-80 clickable`,
  selected && tw`text-primary-60`,
  css`
    & svg {
      fill: ${COLOR.NEUTRAL[80]};
    }
  `,
  selected &&
    css`
      & svg {
        fill: ${COLOR.PRIMARY[60]};
      }
    `,
]);
