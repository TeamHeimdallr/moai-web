import type { Meta } from '@storybook/react';
import tw from 'twin.macro';

import { ButtonPrimarySmall } from '~/components/buttons/primary';

import { usePopup } from '~/hooks/components/use-popup';
import { POPUP_ID } from '~/types/components';

import { ConnectWallet } from '.';

const meta = {
  title: 'Components/ConnectWallet',
  component: ConnectWallet,
  tags: ['autodocs'],
} satisfies Meta<typeof ConnectWallet>;

export default meta;

export const Normal = () => {
  const { opened, open } = usePopup(POPUP_ID.CONNECT_WALLET);

  return (
    <Wrapper>
      <ButtonPrimarySmall text="open preview popup !" onClick={() => open()} />
      {opened && <ConnectWallet />}
    </Wrapper>
  );
};

const Wrapper = tw.div``;
