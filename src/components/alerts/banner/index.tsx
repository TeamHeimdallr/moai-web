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
  w-full h-60 flex-center bg-red-50 gap-16
`;

const TextWrapper = tw.div`
  flex-center gap-4 font-m-14 text-neutral-100
`;
const IconWrapper = tw.div`flex-center`;
