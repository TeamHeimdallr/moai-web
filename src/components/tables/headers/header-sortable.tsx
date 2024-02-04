import { HTMLAttributes, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconArrowDown, IconArrowUp } from '~/assets/icons';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { toggleTableSorting } from '~/utils/util-table';
import { ITableSort } from '~/types';

interface TableHeaderSortableProps extends HTMLAttributes<HTMLDivElement> {
  label: string;

  sortKey: string;
  sort?: ITableSort;
  setSort?: (sorting: ITableSort) => void;

  tableKey?: string;
  align?: 'flex-start' | 'center' | 'flex-end';

  tooltipIcon?: ReactNode;
}
export const TableHeaderSortable = ({
  label,

  sortKey,
  sort,
  setSort,

  tableKey,
  align,

  tooltipIcon,
  ...rest
}: TableHeaderSortableProps) => {
  const { gaAction } = useGAAction();

  const icon =
    sort?.order === 'asc' ? (
      <IconArrowUp width={16} height={16} />
    ) : (
      <IconArrowDown width={16} height={16} />
    );

  const { t } = useTranslation();

  return (
    <SelectableHeaderText
      selected={sort?.key === sortKey}
      onClick={() => {
        gaAction({
          action: 'table-header-sort',
          data: {
            component: 'header-sortable',
            table: tableKey,
            sort: sortKey,
            order: sort?.order,
            label,
          },
        });
        setSort?.(toggleTableSorting({ order: sort?.order ?? 'asc', key: sortKey }));
      }}
      align={align}
      {...rest}
    >
      <InnerWrapper>
        {t(label)}
        {tooltipIcon}
      </InnerWrapper>
      {sort?.key === sortKey && icon}
    </SelectableHeaderText>
  );
};

interface SelectableHeaderPoolProps {
  selected?: boolean;
  align?: 'flex-start' | 'center' | 'flex-end';
}
const SelectableHeaderText = styled.div<SelectableHeaderPoolProps>(({ selected, align }) => [
  tw`
    flex items-center justify-end gap-4 w-full font-m-14 text-neutral-80 clickable
    md:(font-m-16)
    hover:(text-primary-80)
  `,
  selected && tw`text-primary-60 hover:(text-primary-60)`,
  css`
    & svg {
      fill: ${COLOR.NEUTRAL[80]};
    }
    &:hover svg {
      fill: ${COLOR.PRIMARY[80]};
    }
  `,
  selected &&
    css`
      & svg {
        fill: ${COLOR.PRIMARY[60]};
      }
      &:hover svg {
        fill: ${COLOR.PRIMARY[60]};
      }
    `,
  align &&
    css`
      justify-content: ${align};
    `,
]);

const InnerWrapper = tw.div`
  flex items-center gap-2
`;
