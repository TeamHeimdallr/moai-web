import { useNavigate } from 'react-router-dom';
import tw from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconAlert } from '~/assets/icons';

import { ButtonPrimaryLarge } from '~/components/buttons';

import { usePopup } from '~/hooks/components';
import { POPUP_ID } from '~/types';

import { Popup } from '..';

interface Props {
  onClickButton: () => void;
}

export const NetworkAlertPopup = ({ onClickButton }: Props) => {
  const navigate = useNavigate();
  const { close } = usePopup(POPUP_ID.NETWORK_ALERT);
  const isDetailPage = window.location.pathname.includes('pools');
  const poolText = isDetailPage ? 'network' : "pool's network";

  const handleClickSwitchButton = () => {
    onClickButton();
    isDetailPage && navigate('/');
    close();
  };
  return (
    <Popup
      id={POPUP_ID.NETWORK_ALERT}
      title=""
      button={<ButtonPrimaryLarge onClick={handleClickSwitchButton} text="Switch network" />}
    >
      <Wrapper>
        <IconAlert width={60} height={60} fill={COLOR.RED[50]} />
        <Title>The network does not match</Title>
        <Text>
          {`The current ${poolText} and the selected pool's ${poolText} do not match. Would you like to change
        the network to view the details of the selected pool?`}
        </Text>
      </Wrapper>
    </Popup>
  );
};

const Wrapper = tw.div`flex flex-col items-center gap-12 px-24 pb-48`;
const Title = tw.div`font-b-24 text-neutral-100`;
const Text = tw.div`font-r-16 text-neutral-80 text-center`;

export default NetworkAlertPopup;
