import type { Meta } from '@storybook/react';
import tw from 'twin.macro';

import { TOKEN } from '~/constants/constant-vars';

import { PoolCompositionData } from '~/moai-xrp-ledger/types/components';

import Graph from '.';

const meta = {
  title: 'Components/Graph/SemiDoughnut',
  component: Graph,
  tags: ['autodocs'],
} satisfies Meta<typeof Graph>;

export default meta;

const Wrapper = tw.div`w-380 h-190`;

export const DonoutGraph = () => {
  const data: Omit<PoolCompositionData, 'tokenIssuer'>[] = [
    {
      token: TOKEN.MOAI,
      weight: 50,
      value: 5129,
      balance: 7077,
      currentWeight: 50,
    },
    {
      token: TOKEN.WETH,
      weight: 50,
      value: 5129,
      balance: 204,
      currentWeight: 50,
    },
  ];
  return (
    <Wrapper>
      <Graph data={data} />
    </Wrapper>
  );
};
