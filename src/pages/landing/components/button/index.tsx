import tw, { styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconLink } from '~/assets/icons';

interface ButtonLandingProps {
  text: string;
  filled: boolean;
  size: 'medium' | 'large';
}
export const ButtonLanding = ({ text, filled, size }: ButtonLandingProps) => {
  const isMedium = size === 'medium';
  return (
    <Wrapper filled={filled} isMedium={isMedium}>
      <Text filled={filled} isMedium={isMedium}>
        {text}
      </Text>
      <IconLink width={20} height={20} fill={filled ? COLOR.NEUTRAL[0] : COLOR.PRIMARY[60]} />
    </Wrapper>
  );
};

interface Props {
  filled: boolean;
  isMedium: boolean;
}
const Wrapper = styled.div<Props>(({ filled, isMedium }) => [
  tw`flex flex-center rounded-12 gap-8`,
  filled ? tw`bg-primary-60 ` : tw`bg-transparent border border-solid border-primary-60`,
  isMedium ? tw`py-9 pr-10 pl-16` : tw`py-12 pr-20 pl-26`,
]);

const Text = styled.div<Props>(({ filled, isMedium }) => [
  tw`text-center`,
  filled ? tw`text-neutral-0 ` : tw`text-primary-60`,
  isMedium ? tw`font-m-14` : tw`font-m-16 `,
]);
