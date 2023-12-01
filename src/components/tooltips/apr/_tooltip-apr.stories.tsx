import type { Meta, StoryObj } from '@storybook/react';

import { ButtonPrimarySmall } from '~/components/buttons/primary';

import { TOOLTIP_ID } from '~/types';

import { TooltipApr } from '.';

const meta = {
  title: 'Components/Tooltips/TooltipApr',
  component: TooltipApr,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof TooltipApr>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  render: () => (
    <>
      <ButtonPrimarySmall text="Open tooltip" disabled data-tooltip-id={TOOLTIP_ID.APR} />
      <TooltipApr />
    </>
  ),
  args: {},
};
