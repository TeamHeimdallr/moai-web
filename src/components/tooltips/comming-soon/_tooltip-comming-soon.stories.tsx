import type { Meta, StoryObj } from '@storybook/react';

import { ButtonPrimarySmall } from '~/components/buttons/primary';
import { TOOLTIP_ID } from '~/types/components';

import { TooltipCommingSoon } from '.';

const meta = {
  title: 'Components/Tooltips/TooltipCommingSoon',
  component: TooltipCommingSoon,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof TooltipCommingSoon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  render: () => (
    <>
      <ButtonPrimarySmall text="Open tooltip" disabled data-tooltip-id={TOOLTIP_ID.COMMING_SOON} />
      <TooltipCommingSoon />
    </>
  ),
  args: {},
};
