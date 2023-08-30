import type { Meta, StoryObj } from '@storybook/react';

import { ButtonChipMedium } from '.';

const meta = {
  title: 'Components/Buttons/ButtonChipMedium',
  component: ButtonChipMedium,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof ButtonChipMedium>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    text: 'Text here',
  },
};
