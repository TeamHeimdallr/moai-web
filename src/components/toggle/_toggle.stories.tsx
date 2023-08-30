import type { Meta } from '@storybook/react';
import { useState } from 'react';

import { Toggle } from '.';

const meta = {
  title: 'Components/Toggle/toggle',
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

export const _Toggle = () => {
  const [selected, select] = useState(false);
  return <Toggle select={() => select(prev => !prev)} selected={selected} />;
};
