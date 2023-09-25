import type { Meta } from '@storybook/react';
import tw from 'twin.macro';

import { ButtonPrimarySmall } from '~/components/buttons/primary';

import { usePopup } from '~/hooks/pages/use-popup';
import { POPUP_ID } from '~/types/components';

import { SelectWalletPopup } from '.';

const meta = {
  title: 'Components/SelectWalletPopup/SelectWalletPopup',
  component: SelectWalletPopup,
  tags: ['autodocs'],
} satisfies Meta<typeof SelectWalletPopup>;

export default meta;

export const _SelectWalletPopup = () => {
  const { opened, open } = usePopup(POPUP_ID.SAMPLE);

  return (
    <Wrapper>
      <ButtonPrimarySmall text="open preview popup !" onClick={open} />
      {opened && <SelectWalletPopup />}
    </Wrapper>
  );
};

const Wrapper = tw.div``;
