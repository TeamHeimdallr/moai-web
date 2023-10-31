import tw from 'twin.macro';

import { IconLink } from '~/assets/icons';
import LogoText from '~/assets/logos/logo-text.svg?react';

import { ButtonPrimaryLargeIconTrailing } from '~/components/buttons/primary/large-icon-trailing';

export const Gnb = () => {
  return (
    <Wrapper>
      <LogoWrapper>
        <LogoText width={88} />
      </LogoWrapper>
      <ButtonWrapper>
        <ButtonPrimaryLargeIconTrailing
          text="Get started"
          buttonType="filled"
          icon={<IconLink />}
          onClick={() => window.open('https://app.moai-finance.xyz/')}
        />
      </ButtonWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`w-full h-80 flex justify-between items-center bg-transparent px-24 py-20`;
const ButtonWrapper = tw.div`w-157`;
const LogoWrapper = tw.div``;
