import { HTMLAttributes } from 'react';
import { format } from 'date-fns';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconLink, IconTime } from '~/assets/icons';

import { ButtonIconSmall } from '~/components/buttons';

import { DATE_FORMATTER } from '~/utils';

interface Props extends HTMLAttributes<HTMLDivElement> {
  time: number;
  width?: number | 'full';
  hash: string;
}

export const TableColumnTime = ({ time, width, hash, ...rest }: Props) => {
  // TODO : handle url
  const handleClick = () => {
    window.open(hash);
  };
  return (
    <Wrapper width={width} {...rest}>
      <IconWrapper>
        <IconTime width={20} height={20} fill={COLOR.NEUTRAL[60]} />
      </IconWrapper>
      <Time>{format(new Date(time), DATE_FORMATTER.FULL)}</Time>
      <ButtonIconSmall onClick={handleClick} icon={<IconLink fill={COLOR.NEUTRAL[60]} />} />
    </Wrapper>
  );
};

interface WrapperProps {
  width?: number | 'full';
}
const Wrapper = styled.div<WrapperProps>(({ width }) => [
  tw`flex items-center gap-4 flex-shrink-0`,
  width === 'full' && tw`flex-1 w-full`,
  typeof width === 'number' &&
    css`
      width: ${width}px;
    `,
]);
const IconWrapper = tw.div`flex-center`;
const Time = tw.div`flex items-end font-r-12 text-neutral-60 md:font-r-14`;
