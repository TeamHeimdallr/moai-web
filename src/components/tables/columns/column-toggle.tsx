import { HTMLAttributes } from 'react';
import tw from 'twin.macro';

import { Toggle } from '~/components/toggle';

interface Props extends HTMLAttributes<HTMLDivElement> {
  selected: boolean;
  handleSelect: (current: boolean) => void;
}

export const TableColumnToggle = ({ selected, handleSelect, ...rest }: Props) => {
  return (
    <Wrapper {...rest}>
      <Toggle selected={selected} onClick={() => handleSelect(selected)} />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex-center
`;
