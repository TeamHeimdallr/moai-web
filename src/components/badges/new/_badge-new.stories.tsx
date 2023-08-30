import type { Meta, StoryObj } from '@storybook/react';

import { BadgeNew } from '.';

const meta = {
  title: 'Components/Badges/BadgeNew',
  component: BadgeNew,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof BadgeNew>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {},
};
