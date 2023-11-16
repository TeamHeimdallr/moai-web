import { useTranslation } from 'react-i18next';
import tw, { styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconAlert, IconCheck } from '~/assets/icons';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { Popup } from '~/components/popup';

import { usePopup } from '~/hooks/components';
import { POPUP_ID } from '~/types';

import { useCampaignStepStore } from '../../states/step';

interface Props {
  status: 'insufficient' | 'fail' | 'success';
}

export const CampaignCreateFpassPopup = ({ status }: Props) => {
  const { t } = useTranslation();
  const { setStep } = useCampaignStepStore();
  const { close } = usePopup(POPUP_ID.CAMPAIGN_FUTUREPASS_CREATE);

  const title =
    status === 'insufficient'
      ? t`Insufficient $ROOT tokens`
      : status === 'fail'
      ? t`Failed to creating account`
      : t`Creation confirmed!`;

  const text =
    status === 'insufficient'
      ? t`futurepass-not-enough-root`
      : status === 'fail'
      ? t`futurepass-fail-message`
      : t`You have successfully created your Futurepass account.`;

  const buttonText = status === 'success' ? 'Confirm' : 'Try again';

  const handleClick = () => {
    if (status === 'success') {
      setStep('positive');
      return;
    }
    close();
  };

  return (
    <Popup
      id={POPUP_ID.CAMPAIGN_FUTUREPASS_CREATE}
      title=""
      button={<ButtonPrimaryLarge onClick={handleClick} text={t(buttonText)} />}
    >
      <Wrapper status={status}>
        <ContentWrapper>
          {status === 'success' ? (
            <IconWrapper>
              <IconCheck width={40} height={40} fill={COLOR.NEUTRAL[100]} />
            </IconWrapper>
          ) : (
            <IconAlert width={60} height={60} fill={COLOR.RED[50]} />
          )}
          <Title>{t(title)}</Title>
          <Text>{text}</Text>
        </ContentWrapper>
      </Wrapper>
    </Popup>
  );
};

const Wrapper = styled.div(({ status }: Props) => [
  tw`flex flex-col items-center gap-40 px-24 pb-48`,
  status === 'success' && 'pb-40',
]);
const ContentWrapper = tw.div`flex flex-col items-center gap-12`;
const Title = tw.div`font-b-24 text-neutral-100`;
const Text = tw.div`font-r-16 text-neutral-80 text-center`;
const IconWrapper = tw.div`flex-center rounded-full bg-green-50 w-60 h-60`;
