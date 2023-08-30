import { HTMLAttributes } from 'react';
import tw, { styled } from 'twin.macro';

interface Props extends HTMLAttributes<HTMLDivElement> {
  token: string;

  percentage?: number;

  icon?: string;
  iconTitle?: string;

  type?: 'large' | 'small';

  clickable?: boolean;

  selected?: boolean;
  onSelect?: () => void;
}

export const Token = ({
  token,
  percentage,
  icon,
  iconTitle,
  type = 'large',
  selected,
  clickable = true,
  ...rest
}: Props) => {
  return (
    <Wrapper type={type} selected={selected} clickable={clickable} hasIcon={!!icon} {...rest}>
      {icon && <IconWrapper src={icon} title={iconTitle} type={type} />}
      <TextWrapper>
        <TokenText>{token}</TokenText>
        {percentage && <Percentage>{percentage}%</Percentage>}
      </TextWrapper>
    </Wrapper>
  );
};

interface WrapperProps {
  type?: 'large' | 'small';
  selected?: boolean;
  clickable?: boolean;
  hasIcon?: boolean;
}
const Wrapper = styled.div<WrapperProps>(({ type, selected, clickable, hasIcon }) => [
  tw`flex-shrink-0 gap-8 transition-colors inline-flex-center bg-neutral-20 text-neutral-100 basis-auto`,

  selected && tw`border-solid bg-primary-20 border-1 border-primary-60 hover:(bg-primary-20)`,

  type === 'large' && tw`py-8 px-14 rounded-10`,

  type === 'large' && hasIcon && !selected && tw`pl-10 pr-14`,
  type === 'large' && hasIcon && selected && tw`py-7 pl-9 pr-13`,
  type === 'large' && !hasIcon && !selected && tw`px-14`,
  type === 'large' && !hasIcon && selected && tw`py-7 px-13`,

  type === 'small' && tw`px-8 py-4 rounded-6`,
  type === 'small' && selected && tw`py-3 px-7`,

  clickable && tw`clickable`,
  clickable && !selected && tw`hover:(bg-neutral-30)`,
]);

const TextWrapper = tw.div`
  flex gap-4 items-end uppercase
`;

const TokenText = tw.div`
  font-r-16 leading-23
`;
const Percentage = tw.div`
  font-r-12 text-neutral-80
`;

interface IconWrapperProps {
  type?: 'large' | 'small';
}
const IconWrapper = styled.img<IconWrapperProps>(({ type }) => [
  tw`flex-shrink-0 flex-center`,
  type === 'large' && tw`w-24 h-24`,
  type === 'small' && tw`w-20 h-20`,
]);
