import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import tw from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconAlert } from '~/assets/icons';

import { ButtonPrimaryLarge } from '~/components/buttons';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { POPUP_ID } from '~/types';

import { Popup } from '..';

export const NetworkAlertPopup = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { close } = usePopup(POPUP_ID.NETWORK_ALERT);
  const { selectNetwork, targetNetwork, resetTarget } = useNetwork();
  const { t } = useTranslation();
  const text = pathname !== '/' ? t('network-alert-pool-message') : t('network-alert-home-message');

  const handleClickSwitchButton = () => {
    if (!targetNetwork) return;
    selectNetwork(targetNetwork);
    resetTarget();
    close();
    if (pathname !== '/') {
      navigate('/');
    }
  };
  useNetwork;

  return (
    <Popup
      id={POPUP_ID.NETWORK_ALERT}
      title=""
      button={<ButtonPrimaryLarge onClick={handleClickSwitchButton} text={t`Switch network`} />}
    >
      <Wrapper>
        <IconAlert width={60} height={60} fill={COLOR.RED[50]} />
        <Title>{t(`The network does not match`)}</Title>
        <Text>{text}</Text>
      </Wrapper>
    </Popup>
  );
};

const Wrapper = tw.div`flex flex-col items-center gap-12 px-24 pb-48`;
const Title = tw.div`font-b-24 text-neutral-100`;
const Text = tw.div`font-r-16 text-neutral-80 text-center`;

export default NetworkAlertPopup;
