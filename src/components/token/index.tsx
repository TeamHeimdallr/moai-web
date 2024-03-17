import { HTMLAttributes, ReactNode } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import tw, { css, styled } from 'twin.macro';
import { toHex } from 'viem';

import { COLOR } from '~/assets/colors';

interface Props extends HTMLAttributes<HTMLDivElement> {
  token: string;

  title?: string;
  address?: string;
  percentage?: number;

  image?: boolean;
  imageUrl?: string;
  icon?: ReactNode;
  iconWrapper?: boolean;

  type?: 'large' | 'small';

  clickable?: boolean;

  selected?: boolean;
  disabled?: boolean;
}

export const Token = ({
  token,
  title,
  address,
  percentage,
  image = true,
  imageUrl,
  icon,
  iconWrapper = true,
  type = 'large',
  selected,
  clickable = true,
  disabled,
  ...rest
}: Props) => {
  const seed = address || token || title || '';
  return (
    <Wrapper
      type={type}
      selected={selected}
      clickable={clickable}
      disabled={disabled}
      hasImage={!!image}
      icon={!!icon}
      {...rest}
    >
      {image &&
        (imageUrl ? (
          <TokenImageWrapper src={imageUrl} title={token} type={type} />
        ) : (
          <Jazzicon
            diameter={type === 'large' ? 24 : 20}
            seed={jsNumberForAddress(seed?.length < 42 ? toHex(seed, { size: 42 }) : seed)}
          />
        ))}
      <TextWrapper>
        <TokenText type={type}>{title ? title : token}</TokenText>
        {percentage && <Percentage>{percentage}%</Percentage>}
        {icon && iconWrapper ? <IconWrapper>{icon}</IconWrapper> : icon}
      </TextWrapper>
    </Wrapper>
  );
};

interface WrapperProps {
  type?: 'large' | 'small';
  selected?: boolean;
  clickable?: boolean;
  hasImage?: boolean;
  disabled?: boolean;
  icon?: boolean;
}
const Wrapper = styled.div<WrapperProps>(
  ({ type, selected, clickable, disabled, hasImage, icon }) => [
    tw`flex-shrink-0 gap-8 transition-colors inline-flex-center bg-neutral-20 text-neutral-100 basis-auto`,

    selected &&
      !disabled &&
      tw`border-solid bg-primary-20 border-1 border-primary-60 hover:(bg-primary-20)`,

    type === 'large' && tw`py-8 px-14 rounded-10`,

    type === 'large' && hasImage && !selected && tw`pl-10 pr-14`,
    type === 'large' && hasImage && selected && tw`py-7 pl-9 pr-13`,
    type === 'large' && !hasImage && !selected && tw`px-14`,
    type === 'large' && !hasImage && selected && tw`py-7 px-13`,

    type === 'small' && tw`px-8 py-4 rounded-8`,
    type === 'small' && selected && tw`py-3 px-7`,

    icon && tw`pr-8`,

    clickable && !disabled && tw`clickable`,
    clickable && !selected && tw`hover:(bg-neutral-30)`,

    disabled && tw`non-clickable opacity-30 hover:(bg-neutral-20)`,
  ]
);

const TextWrapper = tw.div`
  flex gap-4 items-end
`;

interface TokenWrapperProps {
  type?: 'large' | 'small';
}
const TokenText = styled.div<TokenWrapperProps>(({ type }) => [
  tw`
    font-r-14
  `,
  type === 'large' && tw`font-r-16`,
]);
const Percentage = tw.div`
  font-r-12 text-neutral-80
`;

interface TokenImageWrapperProps {
  type?: 'large' | 'small';
}
const TokenImageWrapper = styled(LazyLoadImage)<TokenImageWrapperProps>(({ type }) => [
  tw`flex-shrink-0 flex-center`,
  type === 'large' && tw`w-24 h-24`,
  type === 'small' && tw`w-20 h-20`,
]);

const IconWrapper = styled.div(() => [
  tw`w-20 h-20 p-2`,
  css`
    & svg {
      width: 16px;
      height: 16px;

      fill: ${COLOR.NEUTRAL[60]};
    }
  `,
]);
