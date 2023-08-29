import path from 'path';

import type { StorybookConfig } from '@storybook/react-vite';
const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [path.dirname(require.resolve(path.join('@storybook/addon-essentials', 'package.json')))],
  core: {},

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  async viteFinal(config) {
    return config;
  },

  docs: {
    autodocs: true
  }
};
export default config;
