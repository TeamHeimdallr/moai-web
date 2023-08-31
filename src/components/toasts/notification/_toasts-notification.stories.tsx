import 'react-toastify/dist/ReactToastify.min.css';

import type { Meta, StoryObj } from '@storybook/react';
import { toast } from 'react-toastify';

import { ButtonPrimarySmall } from '../../buttons/primary';
import { ToastContainer } from '../toast';
import { ToastNotification } from '.';

const meta = {
  title: 'Components/Toasts/ToastNotification',
  component: ToastNotification,
  tags: ['autodocs'],
} satisfies Meta<typeof ToastNotification>;

export default meta;
type Story = StoryObj<typeof meta>;

const toastId = 'toast-notification';
export const Normal: Story = {
  render: args => (
    <>
      <ButtonPrimarySmall
        text="show toast notification"
        onClick={() =>
          toast(<ToastNotification {...args} />, { toastId, type: 'info', icon: false })
        }
      />
      <ToastContainer />
    </>
  ),
  args: {
    title: 'Add liquidity pending',
    description: '$0.10 in 20% MOAI, 80% USDC',
    handleClick: () => window.open('https://testnet.mantlescan.org/'),
    handleClose: () => toast.dismiss(toastId),
  },
};
