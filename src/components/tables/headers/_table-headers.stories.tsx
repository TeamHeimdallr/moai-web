import type { Meta, StoryObj } from '@storybook/react';

import {
  TableHeader,
  TableHeaderAPR,
  TableHeaderAssets,
  TableHeaderComposition,
} from './header-normal';
import { TableHeaderSortable } from './header-sortable';

const meta = {
  title: 'Components/Tables/TableHeader',
  component: TableHeader,
  tags: ['autodocs'],
  argTypes: {
    icon: { control: { disable: true } },
  },
} satisfies Meta<typeof TableHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    label: 'Assets',
  },
};

export const _TableHeaderAssets: Story = {
  render: () => <TableHeaderAssets />,
  args: {
    label: 'Assets',
  },
};

export const _TableHeaderComposition: Story = {
  render: () => <TableHeaderComposition />,
  args: {
    label: 'Assets',
  },
};

export const _TableHeaderAPR: Story = {
  render: () => <TableHeaderAPR />,
  args: {
    label: 'Assets',
  },
};

export const _TableHeaderSortable: Story = {
  render: () => (
    <TableHeaderSortable
      sortKey="VOLUMN"
      label="Volumn(24h)"
      sorting={{ key: 'VOLUMN', order: 'asc' }}
    />
  ),
  args: {
    label: 'Assets',
  },
};