import { useTranslation } from 'react-i18next';
import tw from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconAlert } from '~/assets/icons';

import { ButtonPrimaryLarge } from '~/components/buttons';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { NETWORK, POPUP_ID } from '~/types';

import { Popup } from '../../../components/popup';

export const RewardsNetworkAlertPopup = () => {
  const { ref } = useGAInView({ name: 'reward-network-alery' });
  const { gaAction } = useGAAction();

  const { close } = usePopup(POPUP_ID.REWARD_NETWORK_ALERT);
  const { selectNetwork } = useNetwork();

  const { t } = useTranslation();

  const handleClickSwitchButton = () => {
    gaAction({
      action: 'switch-network',
      buttonType: 'primary-large',
      data: { page: 'rewards', component: 'reward-network-alert' },
    });
    selectNetwork(NETWORK.THE_ROOT_NETWORK);
    close();
  };

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
      <Wrapper ref={ref}>
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
