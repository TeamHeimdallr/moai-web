import type { Meta, StoryObj } from '@storybook/react';

import { ButtonPrimarySmallBlack } from '~/components/buttons';

import { AlertBanner } from '.';

const meta = {
  title: 'Components/Alerts/AlertBanner',
  component: AlertBanner,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof AlertBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    text: 'Please connect to XRPL wallet',
    button: <ButtonPrimarySmallBlack text="Connect wallet" />,
  },
};
