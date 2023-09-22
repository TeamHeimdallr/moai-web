import tw from 'twin.macro';
import { useSwitchNetwork } from 'wagmi';

import { COLOR } from '~/assets/colors';
import { IconAlert } from '~/assets/icons';

import { ButtonPrimarySmall } from '~/components/buttons/primary/small-black';

import { CHAIN_ID, CURRENT_CHAIN } from '~/moai-evm/constants';

interface Props {
  chainName?: string;
  chainId?: number;
}
export const SwitchNetwork = ({ chainName, chainId }: Props) => {
  const { switchNetwork } = useSwitchNetwork();

  return (
    <Wrapper>
      <TextWrapper>
        <IconAlert width={20} height={20} color={COLOR.NEUTRAL[100]} />
        {`Please switch to ${chainName ?? CURRENT_CHAIN}`}
      </TextWrapper>
      <ButtonPrimarySmall
        text="Switch network"
        onClick={() => switchNetwork?.(chainId ?? CHAIN_ID)}
      />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full h-60 flex-center bg-red-50 gap-16
`;

const TextWrapper = tw.div`
  flex-center gap-4 font-m-14 text-neutral-100
`;
