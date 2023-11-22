import { HTMLAttributes, ReactNode } from 'react';
import tw from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconAlert } from '~/assets/icons';

interface Props extends HTMLAttributes<HTMLDivElement> {
  text: string;
  button?: ReactNode;
}
export const AlertBanner = ({ text, button, ...rest }: Props) => {
  return (
    <Wrapper {...rest}>
      <TextWrapper>
        <IconWrapper>
          <IconAlert width={20} height={20} color={COLOR.NEUTRAL[100]} />
        </IconWrapper>
        {text}
      </TextWrapper>
      {button}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full flex items-center bg-red-50 px-12
  h-52 justify-between
  md:(h-60 gap-16 justify-center)
`;

const TextWrapper = tw.div`
  flex-center gap-4 text-neutral-100
  font-m-12
  md:(font-m-14)
`;
const IconWrapper = tw.div`flex-center`;
