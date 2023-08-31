import type { Meta, StoryObj } from '@storybook/react';

import { ButtonPrimarySmall } from '.';

const meta = {
  title: 'Components/Buttons/ButtonPrimarySmallBlack',
  component: ButtonPrimarySmall,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof ButtonPrimarySmall>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    text: 'Text here',
  },
};
