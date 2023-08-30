import type { Meta, StoryObj } from '@storybook/react';

import { useTableLiquidityPool } from '~/hooks/components/tables/use-table-liquidity-pool';
import { LiquidityPoolTable } from '~/types/components/tables';

import { Table } from '.';

const meta = {
  title: 'Components/Tables/Table',
  component: Table,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  render: () => <Template />,
  args: { data: [], columns: [] },
};

const Template = () => {
  const { data, columns } = useTableLiquidityPool();

  return <Table<LiquidityPoolTable> data={data} columns={columns} hasMore />;
};
