import { toast, ToastContainer } from 'react-toastify';
import type { Meta, StoryObj } from '@storybook/react';

import { ButtonPrimarySmall } from '../../buttons/primary';

import 'react-toastify/dist/ReactToastify.min.css';

const meta = {
  title: 'Components/Toasts/Toast',
  component: ToastContainer,
  tags: ['autodocs'],
} satisfies Meta<typeof ToastContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  render: () => (
    <>
      <ButtonPrimarySmall text="show toast" onClick={() => toast('Wow so easy !')} />
      <ToastContainer />
    </>
  ),
  args: {},
};
