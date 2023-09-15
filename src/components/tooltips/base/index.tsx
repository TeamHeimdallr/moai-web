import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { ITooltip, Tooltip as ReactTooltip } from 'react-tooltip';
import tw, { styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { TOOLTIP_ID } from '~/types/components';

interface Props extends ITooltip {
  id: TOOLTIP_ID;
  children?: ReactNode;
}

export const Tooltip = ({ id, children, ...rest }: Props) => {
  return (
    <Wrapper>
      <ReactTooltip id={id} style={{ zIndex: 100 }} {...rest}>
        {children}
      </ReactTooltip>
    </Wrapper>
  );
};

const Wrapper = styled.div(() => [
  tw`font-r-12 text-neutral-100`,
  css`
    .react-tooltip {
      background-color: ${COLOR.NEUTRAL[30]};

      border-radius: 8px;
      padding: 8px 12px;

      box-shadow: 0px 4px 24px 0px rgba(25, 27, 40, 0.6);
    }
  `,
]);
