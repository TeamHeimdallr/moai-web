import type { Meta, StoryObj } from '@storybook/react';

import { TOKEN } from '~/types/contracts';

import { TableColumn, TableColumnToken, TableColumnTokenIcon } from '.';

const meta = {
  title: 'Components/Tables/TableColumn',
  component: TableColumn,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof TableColumn>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    value: '$123,123,123.12',
  },
};

export const _TableColumnToken: Story = {
  render: () => (
    <TableColumnToken
      tokens={
        {
          [TOKEN.MNT]: 20,
          [TOKEN.DAI]: 80,
        } as Record<TOKEN, number>
      }
    />
  ),
  args: {
    value: '$123,123,123.12',
  },
};

export const _TableColumnTokenIcon: Story = {
  render: () => <TableColumnTokenIcon tokens={[TOKEN.MNT, TOKEN.DAI]} />,
  args: {
    value: '$123,123,123.12',
  },
};
