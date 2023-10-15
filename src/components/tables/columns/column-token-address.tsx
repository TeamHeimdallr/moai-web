import { HTMLAttributes } from 'react';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconLink } from '~/assets/icons';

import { TOKEN_IMAGE_MAPPER } from '~/constants';

interface Props extends HTMLAttributes<HTMLDivElement> {
  token: string;

  hideIcon?: boolean;
  width?: number | 'full';
  align?: 'flex-start' | 'center' | 'flex-end';
}
export const TableColumnTokenAddress = ({ token, width, align, hideIcon, ...rest }: Props) => {
  const tokenImage = TOKEN_IMAGE_MAPPER[token];

  return (
    <Wrapper width={width} align={align} {...rest}>
      <LogoWraper src={tokenImage} title={token} />
      <TextWrapper>
        {token}
        {!hideIcon && (
          <IconWrapper>
            <IconLink />
          </IconWrapper>
        )}
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

const LogoWraper = tw.img`
  flex flex-center w-36 h-36 rounded-full overflow-hidden
`;

const TextWrapper = tw.div`
  flex gap-4 items-center address
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
