import type { Meta } from '@storybook/react';
import tw from 'twin.macro';

import { ButtonPrimaryLarge } from '~/components/buttons';

import { usePopup } from '~/hooks/components/use-popup';
import { POPUP_ID } from '~/types';

import NetworkAlertPopup from '.';

const meta = {
  title: 'Components/Popup/NetworkAlertPopup',
  component: NetworkAlertPopup,
  tags: ['autodocs'],
} satisfies Meta<typeof NetworkAlertPopup>;

export default meta;

const Wrapper = tw.div``;

export const NoButton = () => {
  const { opened, open } = usePopup(POPUP_ID.NETWORK_ALERT);

  return (
    <Wrapper>
      <ButtonPrimaryLarge text="open popup !" onClick={() => open()} />
      {opened && <NetworkAlertPopup />}
    </Wrapper>
  );
};
