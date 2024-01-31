import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import tw from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconAlert } from '~/assets/icons';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { Popup } from '~/components/popup';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { usePopup } from '~/hooks/components';
import { POPUP_ID } from '~/types';

export const RewardsNetworkAlertPopup = () => {
  const { gaAction } = useGAAction();

  const { close, callback, unmountCallback } = usePopup(POPUP_ID.REWARD_NETWORK_ALERT);

  const { t } = useTranslation();

  const handleClickSwitchButton = () => {
    gaAction({
      action: 'switch-network',
      buttonType: 'primary-large',
      data: {
        page: 'rewards',
        component: 'reward-network-alert',
      },
    });

    if (callback) {
      callback();
      return;
    }

    close();
  };

  useEffect(() => {
    return () => unmountCallback?.();
  }, [unmountCallback]);

  return (
    <Popup
      id={POPUP_ID.REWARD_NETWORK_ALERT}
      title=""
      button={
        <ButtonPrimaryLarge
          onClick={handleClickSwitchButton}
          text={t`Switch to The Root Network`}
        />
      }
    >
      <Wrapper>
        <IconAlert width={60} height={60} fill={COLOR.RED[50]} />
        <Title>{t(`The network does not match`)}</Title>
        <Text>{t(`rewards-network-alert-message`)}</Text>
      </Wrapper>
    </Popup>
  );
};

const Wrapper = tw.div`flex flex-col items-center gap-12 px-24 pb-48`;
const Title = tw.div`font-b-24 text-neutral-100`;
const Text = tw.div`font-r-16 text-neutral-80 text-center`;
