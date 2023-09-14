import type { Meta, StoryObj } from '@storybook/react';

import { AccountProfile } from '.';

const meta = {
  title: 'Components/AccountProfile/AccountProfile',
  component: AccountProfile,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof AccountProfile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {},
};
