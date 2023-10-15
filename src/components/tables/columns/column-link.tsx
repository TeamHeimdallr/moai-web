import { HTMLAttributes } from 'react';
import tw, { css, styled } from 'twin.macro';

import { IconLink } from '~/assets/icons';

import { ButtonIconSmall } from '~/components/buttons';

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
        <ButtonIconSmall icon={<IconLink />} />
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
