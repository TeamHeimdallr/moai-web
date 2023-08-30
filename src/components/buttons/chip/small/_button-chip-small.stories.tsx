import type { Meta, StoryObj } from '@storybook/react';

import { ButtonChipSmall } from '.';

const meta = {
  title: 'Components/Buttons/ButtonChipSmall',
  component: ButtonChipSmall,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof ButtonChipSmall>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    text: 'Text here',
  },
};
