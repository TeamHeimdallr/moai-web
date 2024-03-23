import { HTMLAttributes } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import tw, { styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconCancel } from '~/assets/icons';

import { IPoolTokenList } from '~/types';

interface Props extends HTMLAttributes<HTMLDivElement> {
  token: IPoolTokenList;
  image?: string;
  selected?: boolean;
}

export const ButtonChipFilter = ({ selected, token, image, ...rest }: Props) => {
  return (
    <Wrapper selected={selected} {...rest}>
      <Image src={image || token.image} />
      <TextWrapper>
        {token.symbol}
        {selected && (
          <IconWrapper>
            <IconCancel width={16} height={16} fill={COLOR.NEUTRAL[60]} />
          </IconWrapper>
        )}
      </TextWrapper>
    </Wrapper>
  );
};

interface WrapperProps {
  selected?: boolean;
}
const Wrapper = styled.div<WrapperProps>(({ selected }) => [
  tw`
    flex gap-8 items-center font-r-14
    md:(font-r-16)
    hover:(text-neutral-100 clickable)
  `,
  selected ? tw`text-neutral-100` : tw`text-neutral-80`,
]);
const Image = tw(LazyLoadImage)`
  w-20 h-20 rounded-10 bg-black
`;
const TextWrapper = tw.div`flex gap-4`;
const IconWrapper = tw.div`flex-center`;
