import tw from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconMedium, IconTelegram, IconX } from '~/assets/icons';
import { ReactComponent as LogoText } from '~/assets/logos/logo-text.svg';

export const LandingFooter = () => {
  return (
    <Wrapper>
      <InnerWrapper>
        <LogoText width={70} height={16} />
        <Text>© 2023 Moai Finance, Inc. All Rights Reserved</Text>
        <IconWrapper>
          <Icon>
            <IconX width={24} fill={COLOR.NEUTRAL[60]} />
          </Icon>
          <Icon>
            <IconMedium width={24} fill={COLOR.NEUTRAL[60]} />
          </Icon>
          <Icon>
            <IconTelegram width={24} fill={COLOR.NEUTRAL[60]} />
          </Icon>
        </IconWrapper>
      </InnerWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`w-full bg-transparent`;
const InnerWrapper = tw.div`w-full h-full flex flex-col justify-center items-center gap-16`;
const Text = tw.div`text-neutral-60`;
const IconWrapper = tw.div`flex justify-center items-center gap-8`;
const Icon = tw.div`w-40 h-40 flex flex-center clickable `;
