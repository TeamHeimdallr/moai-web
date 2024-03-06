import { HTMLAttributes } from 'react';
import tw from 'twin.macro';

import { Toggle } from '~/components/toggle';

interface Props extends HTMLAttributes<HTMLDivElement> {
  selected: boolean;
  handleSelect: (current: boolean) => void;

  disabled?: boolean;
}

export const TableColumnToggle = ({ selected, handleSelect, disabled, ...rest }: Props) => {
  return (
    <Wrapper {...rest}>
      <Toggle
        selected={selected}
        disabled={disabled}
        onClick={e => {
          e.stopPropagation();
          handleSelect(selected);
        }}
      />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex-center
`;
