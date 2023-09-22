import { HTMLAttributes } from 'react';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconCheck } from '~/assets/icons';

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'id'> {
  image?: string;
  imageTitle?: string;
  imageAlt?: string;

  id: string;
  text: string;

  handleSelect?: (id: string) => void;
  selected?: boolean;

  disabled?: boolean;
}

export const DropdownList = ({
  image,
  imageAlt,
  imageTitle,
  text,
  id,
  handleSelect,
  selected,
  disabled,
  ...rest
}: Props) => {
  const handleClick = () => {
    if (disabled) return;
    handleSelect?.(id);
  };

  return (
    <Wrapper onClick={handleClick} disabled={disabled} {...rest}>
      {image && <Image src={image} alt={imageAlt ?? 'image'} title={imageTitle} />}
      <Text disabled={disabled}>{text}</Text>
      {selected && !disabled && (
        <IconWrapper>
          <IconCheck width={24} height={24} fill={COLOR.GREEN[50]} />
        </IconWrapper>
      )}
    </Wrapper>
  );
};

interface WrapperProps {
  disabled?: boolean;
}
const Wrapper = styled.div<WrapperProps>(({ disabled }) => [
  tw`
    w-full pl-12 pr-8 py-8 flex gap-8 rounded-8 clickable select-none
    hover:(bg-neutral-20)
  `,
  disabled && tw`non-clickable`,
  disabled &&
    css`
      & > img {
        opacity: 0.4;
      }
    `,
]);

const Image = tw.img`
  w-24 h-24 object-cover flex-shrink-0 flex-center
`;

interface TextProps {
  disabled?: boolean;
}
const Text = styled.div<TextProps>(({ disabled }) => [
  tw`flex flex-1 font-r-16 text-neutral-100`,
  disabled && tw`text-neutral-60`,
]);

const IconWrapper = tw.div`
  w-24 h-24 flex-center flex-shrink-0
`;
