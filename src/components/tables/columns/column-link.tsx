import { HTMLAttributes } from 'react';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconLink } from '~/assets/icons';

interface Props extends HTMLAttributes<HTMLDivElement> {
  token: string;
  link?: string;

  width?: number | 'full';
  align?: 'flex-start' | 'center' | 'flex-end';
}
export const TableColumnLink = ({ token, link, width, align, ...rest }: Props) => {
  const handleClick = () => {
    if (!link) return;
    window.open(link);
  };

  return (
    <Wrapper width={width} align={align} onClick={handleClick} {...rest}>
      <TextWrapper>
        {token}
        <IconWrapper>
          <IconLink />
        </IconWrapper>
      </TextWrapper>
    </Wrapper>
  );
};

interface WrapperProps {
  width?: number | 'full';
  align?: 'flex-start' | 'center' | 'flex-end';
}
const Wrapper = styled.div<WrapperProps>(({ width, align }) => [
  tw`flex items-center justify-start flex-shrink-0 gap-12 font-r-16 text-neutral-100`,

  width === 'full' && tw`flex-1 w-full`,
  typeof width === 'number' &&
    css`
      width: ${width}px;
    `,

  align &&
    css`
      justify-content: ${align};
    `,
]);

const TextWrapper = tw.div`
  flex gap-4 items-center
`;

const IconWrapper = styled.div(() => [
  tw`p-2 flex-center clickable`,
  css`
    & svg {
      width: 16px;
      height: 16px;
      fill: ${COLOR.NEUTRAL[60]};
    }

    &:hover svg {
      fill: ${COLOR.NEUTRAL[80]};
    }
  `,
]);
