import type { Meta } from '@storybook/react';
import tw from 'twin.macro';

import { ButtonPrimarySmall } from '~/components/buttons/primary';
import { Popup } from '~/components/popup';
import { usePopup } from '~/hooks/pages/use-popup';
import { POPUP_ID } from '~/types/components';
import { TOKEN } from '~/types/contracts';

import { AddLpPopup } from '.';

const meta = {
  title: 'Components/AddLpPopup',
  component: Popup,
  tags: ['autodocs'],
} satisfies Meta<typeof Popup>;

export default meta;

export const _AddLpPopup = () => {
  const { opened, open } = usePopup(POPUP_ID.ADD_LP);

  return (
    <Wrapper>
      <ButtonPrimarySmall text="open preview popup !" onClick={open} />
      {opened && (
        <AddLpPopup
          tokenList={[
            { name: TOKEN.MOAI, amount: 4.49 },
            { name: TOKEN.WETH, amount: 0.1 },
          ]}
          totalValue={810.45}
          lpName={'80MOAI-20WETH'}
          priceImpact={0.13}
        />
      )}
    </Wrapper>
  );
};

const Wrapper = tw.div``;
