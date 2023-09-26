import { HTMLAttributes } from 'react';
import tw, { styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconCancel } from '~/assets/icons';

import { TOKEN, TOKEN_IMAGE_MAPPER } from '~/constants';

interface Props extends HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  token: TOKEN;
}

export const FilterChip = ({ selected, token, ...rest }: Props) => {
  return (
    <Wrapper selected={selected} {...rest}>
      <Image src={TOKEN_IMAGE_MAPPER[token]} />
      <TextWrapper>
        {token}
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
  tw`flex gap-8 items-center font-r-16 hover:text-neutral-100 clickable`,
  selected ? tw`text-neutral-100` : tw`text-neutral-80`,
]);
const Image = tw.img`w-20 h-20 rounded-10 bg-black`;
const TextWrapper = tw.div`flex gap-4`;
const IconWrapper = tw.div`flex-center`;
