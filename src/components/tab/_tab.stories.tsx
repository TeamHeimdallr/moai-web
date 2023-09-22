import { useState } from 'react';
import type { Meta } from '@storybook/react';
import tw from 'twin.macro';

import { Tab } from '.';

const meta = {
  title: 'Components/Tab/Tab',
} satisfies Meta;

export default meta;

export const _Medium = () => {
  const [selectedTap, select] = useState<string>();
  const tabs = [
    { key: 'all', name: 'All liquidity provision' },
    { key: 'my', name: 'My liquidity' },
    { key: 'your', name: 'Your liquidity' },
  ];

  const onClick = (key: string) => {
    select(key);
  };
  return (
    <Wrapper>
      <Tab tabs={tabs} onClick={onClick} selectedTab={selectedTap} />
    </Wrapper>
  );
};
export const _Large = () => {
  const [selectedTap, select] = useState<string>();
  const tabs = [
    { key: 'all', name: 'All liquidity provision' },
    { key: 'my', name: 'My liquidity' },
    { key: 'your', name: 'Your liquidity' },
  ];

  const onClick = (key: string) => {
    select(key);
  };
  return (
    <Wrapper>
      <Tab type="large" tabs={tabs} onClick={onClick} selectedTab={selectedTap} />
    </Wrapper>
  );
};
const Wrapper = tw.div``;
