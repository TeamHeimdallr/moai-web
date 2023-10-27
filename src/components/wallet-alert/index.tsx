import tw from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconAlert } from '~/assets/icons';

import { useNetwork } from '~/hooks/contexts/use-network';

import { ButtonPrimarySmall } from '../buttons';

export const WalletAlert = () => {
  const { name } = useNetwork();
  return (
    <Wrapper>
      <TextWrapper>
        <IconAlert width={20} height={20} color={COLOR.NEUTRAL[100]} />
        {`Please connect to ${name} wallet`}
      </TextWrapper>
      <ButtonWrapper>
        <ButtonPrimarySmall text="Connect wallet" isGrayScale={true} />
      </ButtonWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full h-60 flex-center bg-red-50 gap-16
`;

const ButtonWrapper = tw.div``;

const TextWrapper = tw.div`
  flex-center gap-4 font-m-14 text-neutral-100
`;
