import type { Meta } from '@storybook/react';
import tw from 'twin.macro';

import { IconCheck } from '~/assets/icons';
import { TOKEN_IMAGE_MAPPER } from '~/constants';
import { usePopup } from '~/hooks/pages/use-popup';
import { POPUP_ID } from '~/types/components/popup';

import { ButtonPrimaryLarge, ButtonPrimarySmall } from '../buttons/primary';
import { TokenList } from '../token-list';
import { Popup } from '.';

const meta = {
  title: 'Components/Popup/Popup',
  component: Popup,
  tags: ['autodocs'],
} satisfies Meta<typeof Popup>;

export default meta;

const Wrapper = tw.div``;
const Text = tw.div`text-white`;

export const NoButton = () => {
  const { opened, open } = usePopup(POPUP_ID.SAMPLE);

  return (
    <Wrapper>
      <ButtonPrimarySmall text="open popup !" onClick={open} />
      {opened && (
        <Popup
          id={POPUP_ID.SAMPLE}
          title="Select token"
          content={
            <TokenList
              type="selectable"
              title={'MOAI'}
              description={'$100'}
              image={TOKEN_IMAGE_MAPPER['USDC']}
              balance="1,234"
              price="$8.00"
            />
          }
        />
      )}
    </Wrapper>
  );
};

export const HasButton = () => {
  return (
    <Popup
      id={POPUP_ID.SAMPLE}
      title="Preview swap"
      button={<ButtonPrimaryLarge text="Confirm swap" />}
      content={<Text>content here</Text>}
    />
  );
};

export const Success = () => {
  return (
    <Popup
      id={POPUP_ID.SAMPLE}
      title="Preview swap"
      button={<ButtonPrimaryLarge text="Confirm swap" />}
      content={<Text>content here</Text>}
      icon={
        <IconWrapper>
          <IconCheck />
        </IconWrapper>
      }
    />
  );
};
const IconWrapper = tw.div`flex-center w-32 h-32 rounded-full bg-green-50`;
