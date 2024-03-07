import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import tw from 'twin.macro';

import { usePostCreateReferral } from '~/api/api-server/rewards/create-referral';

import { IconCheck } from '~/assets/icons';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { InputText } from '~/components/inputs/text';
import { Popup } from '~/components/popup';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { usePopup } from '~/hooks/components/use-popup';
import { POPUP_ID } from '~/types/components';

interface Props {
  walletAddress: string;
  waveId: number;
  networkAbbr: string;
}
export const RewardBindReferralPopup = ({ walletAddress, waveId, networkAbbr }: Props) => {
  const { ref } = useGAInView({ name: 'bind-referral' });
  const { gaAction } = useGAAction();

  const { close } = usePopup(POPUP_ID.REWARD_BIND_REFERRAL);
  const { t } = useTranslation();

  const [value, setValue] = useState<string | undefined>(undefined);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const { mutateAsync, isLoading, data, isSuccess } = usePostCreateReferral({
    params: { networkAbbr },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    if (!value) {
      setValue(undefined);
      setError(false);
      return;
    }

    setValue(value);
    if (value.length !== 8) {
      setError(true);
      setErrorMessage('Please enter 8 letters and numbers.');

      return;
    }

    setError(false);
  };

  const handleConfirm = async () => {
    await mutateAsync({ walletAddress, code: value || '', wave: waveId });

    gaAction({
      action: 'bind-referrer',
      data: { walletAddress, code: value || '', wave: waveId },
    });
  };

  useEffect(() => {
    if (!data) return;

    const { success, message } = data;
    if (!success) {
      setError(true);
      setErrorMessage(message);
      return;
    }

    setError(false);
    setErrorMessage(undefined);
  }, [data, isSuccess]);

  const isSuccessful = isSuccess && data?.success;

  return (
    <Popup
      id={POPUP_ID.REWARD_BIND_REFERRAL}
      title={isSuccessful ? '' : t('Bind Referrer')}
      button={
        isSuccessful ? (
          <ButtonPrimaryLarge buttonType="outlined" text={t('Ok')} onClick={() => close()} />
        ) : (
          <ButtonPrimaryLarge
            text={t('Confirm')}
            disabled={error || isLoading || !value}
            onClick={handleConfirm}
          />
        )
      }
    >
      <Wrapper ref={ref}>
        {isSuccessful ? (
          <SuccessWrapper>
            <IconWrapper>
              <IconCheck width={40} height={40} />
            </IconWrapper>
            <SuccessTitle>{t('Bound confirmed!')}</SuccessTitle>
            <SuccessSubTitle>
              {t('You have just successfully bound with', { code: value })}
            </SuccessSubTitle>
          </SuccessWrapper>
        ) : (
          <>
            <Description>{t('bind-referrer-popup-description')}</Description>
            <InputText
              label={t('Referral code')}
              error={error}
              errorMessage={t(errorMessage || '')}
              onChange={handleChange}
            />
          </>
        )}
      </Wrapper>
    </Popup>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-24 px-24 pb-24
`;

const Description = tw.div`
  font-r-14 text-neutral-100
`;

const SuccessTitle = tw.div`
  text-neutral-100 font-b-24
`;

const SuccessSubTitle = tw.div`
  text-neutral-80 font-r-16
`;

const SuccessWrapper = tw.div`
  flex-center flex-col gap-12
`;

const IconWrapper = tw.div`
  flex-center w-48 h-48 rounded-full bg-green-50
`;
