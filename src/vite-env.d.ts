/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

import { css as cssImport } from '@emotion/react';
import { CSSInterpolation } from '@emotion/serialize';
import styledImport from '@emotion/styled';

import 'twin.macro';

declare module 'twin.macro' {
  // The styled and css imports
  const styled: typeof styledImport;
  const css: typeof cssImport;
}

declare module 'react' {
  // The tw and css prop
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface DOMAttributes<T> {
    tw?: string;
    css?: CSSInterpolation;
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    gemWallet?: boolean;
    crossmark?: any;
    ethereum: {
      isMetaMask?: boolean;
      [key: string]: any;
    };
  }
}
