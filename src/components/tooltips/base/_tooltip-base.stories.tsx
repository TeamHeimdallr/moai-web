import type { Meta, StoryObj } from '@storybook/react';

import { ButtonPrimarySmall } from '~/components/buttons/primary';

import { TOOLTIP_ID } from '~/types';

import { Tooltip } from '.';

const meta = {
  title: 'Components/Tooltips/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  render: () => (
    <>
      <ButtonPrimarySmall
        text="Open tooltip"
        disabled
        data-tooltip-id={TOOLTIP_ID.STORYBOOK_EXAMPLE}
      />
      <Tooltip id={TOOLTIP_ID.STORYBOOK_EXAMPLE} isOpen>
        Comming soon
      </Tooltip>
    </>
  ),
  args: {
    id: TOOLTIP_ID.STORYBOOK_EXAMPLE,
  },
};
