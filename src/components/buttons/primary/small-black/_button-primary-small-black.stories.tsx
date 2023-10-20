import type { Meta, StoryObj } from '@storybook/react';

import { ButtonPrimarySmallBlack } from '.';

const meta = {
  title: 'Components/Buttons/ButtonPrimarySmallBlack',
  component: ButtonPrimarySmallBlack,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof ButtonPrimarySmallBlack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    text: 'Text here',
  },
};
