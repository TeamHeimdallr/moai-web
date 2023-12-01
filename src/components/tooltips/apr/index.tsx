import { ITooltip } from 'react-tooltip';
import tw from 'twin.macro';

import { TOOLTIP_ID } from '~/types';

import { Tooltip } from '../base';

interface Props extends Omit<ITooltip, 'id'> {
  id?: TOOLTIP_ID;

  swapApr?: string;
  moaiApr?: string;
}

export const TooltipApr = ({ id, swapApr, moaiApr, ...rest }: Props) => {
  return (
    <Tooltip {...rest} id={id ?? TOOLTIP_ID.APR}>
      <Content>{`${swapApr} Swap APR\n${moaiApr} $MOAI Pre-mining APR`}</Content>
    </Tooltip>
  );
};

const Content = tw.div`
  whitespace-pre-wrap
`;
