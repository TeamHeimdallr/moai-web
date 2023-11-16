import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import tw, { css, styled } from 'twin.macro';

import { useCreateFuturepass } from '~/api/api-contract/_evm/substrate/create-futurepass';

import { IconBack } from '~/assets/icons';
import { termsAndConditions } from '~/assets/text/fp-terms-and-conditions';

import { ButtonIconLarge, ButtonPrimaryLarge } from '~/components/buttons';
import { Checkbox } from '~/components/inputs';

import { usePopup } from '~/hooks/components';
import { useConnectedWallet } from '~/hooks/wallets';
import { POPUP_ID } from '~/types';

import { CampaignCreateFpassPopup } from './popup';

interface Props {
  close: () => void;
}

export const CreateFuturepass = ({ close }: Props) => {
  const [checked, check] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { fpass } = useConnectedWallet();
  const { createFuturepass, isError, errorCode } = useCreateFuturepass();
  const { open, opened } = usePopup(POPUP_ID.CAMPAIGN_FUTUREPASS_CREATE);

  const { t } = useTranslation();

  const handleClick = async () => {
    setIsLoading(true);
    await createFuturepass();
    fpass.refetch();
    setIsLoading(false);
    open();
  };

  const status = isError
    ? errorCode.toString().includes('InsufficientBalance')
      ? 'insufficient'
      : 'fail'
    : 'success';

  return (
    <Wrapper>
      <ContentWrapper>
        <TitleWrapper>
          <ButtonIconLarge icon={<IconBack />} onClick={close} />
          <Title>Create Futurepass</Title>
        </TitleWrapper>
        <Description>
          Terms and conditions
          <Text>
            To connect the Futurepass, your agreement to the terms and conditions of service is
            required.
          </Text>
        </Description>
        <Scroll>{termsAndConditions}</Scroll>
        <CheckTerm>
          <Checkbox onClick={() => check(prev => !prev)} selected={checked} />
          <CheckText>{t`futurepass-agree`}</CheckText>
        </CheckTerm>
      </ContentWrapper>

      <ButtonPrimaryLarge
        disabled={!checked}
        isLoading={isLoading}
        onClick={handleClick}
        text={isLoading ? `Creating your futurepass...` : `Create FuturePass`}
      />
      {opened && <CampaignCreateFpassPopup status={status} />}
    </Wrapper>
  );
};
const Wrapper = tw.div`absolute flex flex-col gap-40 p-24 pt-20 z-10 bg-neutral-10 rounded-12`;
const ContentWrapper = tw.div`flex flex-col gap-20`;
const TitleWrapper = tw.div`flex items-center gap-4`;
const Title = tw.div`font-b-18 text-neutral-100`;
const Description = tw.div`flex flex-col text-neutral-100 font-b-16 gap-8`;
const Text = tw.div`font-r-14 text-neutral-80`;
const Scroll = styled.div(() => [
  tw`
      flex flex-col w-full max-h-368 overflow-auto text-neutral-90 whitespace-pre-wrap bg-neutral-5 rounded-8 gap-8 py-16 pl-20 pr-24 font-r-12
    `,
  css`
    scroll-behavior: smooth;
    &::-webkit-scrollbar {
      width: 4px;
      height: auto;
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      visibility: hidden;
      background: #515a68;
      -webkit-border-radius: 2px;
    }
    &:hover::-webkit-scrollbar-thumb {
      visibility: visible;
    }
  `,
]);
const CheckTerm = tw.div`flex gap-16 font-r-14 text-neutral-100 items-start w-full`;
interface DivProps {
  error?: boolean;
}
const CheckText = styled.div<DivProps>(({ error }) => [error && tw`text-red-50`]);
