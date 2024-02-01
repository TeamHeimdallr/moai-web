import { HTMLAttributes } from 'react';
import tw from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconCancel, IconCheck } from '~/assets/icons';

interface Props extends HTMLAttributes<HTMLDivElement> {
  active: boolean;
}

export const TableColumnCheck = ({ active, ...rest }: Props) => {
  return (
    <Wrapper {...rest}>
      {active ? (
        <IconCheck width={24} height={24} fill={COLOR.GREEN[50]} />
      ) : (
        <IconCancel width={24} height={24} fill={COLOR.NEUTRAL[40]} />
      )}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex-center
`;
