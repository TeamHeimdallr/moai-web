import { HTMLAttributes } from 'react';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconCancel, IconCheck } from '~/assets/icons';

interface Props extends HTMLAttributes<HTMLDivElement> {
  active: boolean;
  align?: 'flex-start' | 'center' | 'flex-end';
}

export const TableColumnCheck = ({ active, align, ...rest }: Props) => {
  return (
    <Wrapper align={align} {...rest}>
      {active ? (
        <IconCheck width={24} height={24} fill={COLOR.GREEN[50]} />
      ) : (
        <IconCancel width={24} height={24} fill={COLOR.NEUTRAL[40]} />
      )}
    </Wrapper>
  );
};

interface WrapperProps {
  align?: 'flex-start' | 'center' | 'flex-end';
}
const Wrapper = styled.div<WrapperProps>(({ align }) => [
  tw`
    flex-center
  `,
  align &&
    css`
      align-items: ${align};
    `,
]);
