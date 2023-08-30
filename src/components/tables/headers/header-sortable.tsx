import { HTMLAttributes } from 'react';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconArrowDown, IconArrowUp } from '~/assets/icons';
import { SortingState } from '~/types/components/tables';
import { toggleSorting } from '~/utils/table';

interface TableHeaderSortableProps extends HTMLAttributes<HTMLDivElement> {
  label: string;

  sortKey: string;
  sorting?: SortingState;
  setSorting?: (sorting: SortingState) => void;
}
export const TableHeaderSortable = ({
  label,

  sortKey,
  sorting,
  setSorting,

  ...rest
}: TableHeaderSortableProps) => {
  const icon =
    sorting?.order === 'asc' ? (
      <IconArrowUp width={16} height={16} />
    ) : (
      <IconArrowDown width={16} height={16} />
    );

  return (
    <SelectableHeaderText
      selected={sorting?.key === sortKey}
      onClick={() => setSorting?.(toggleSorting({ order: sorting?.order ?? 'asc', key: sortKey }))}
      {...rest}
    >
      {label}
      {sorting?.key === sortKey && icon}
    </SelectableHeaderText>
  );
};

interface SelectableHeaderPoolProps {
  selected?: boolean;
}
const SelectableHeaderText = styled.div<SelectableHeaderPoolProps>(({ selected }) => [
  tw`
    flex items-center justify-end gap-4 w-160 font-m-16 text-neutral-80 clickable
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
]);
