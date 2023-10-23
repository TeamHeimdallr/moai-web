import { ITooltip } from 'react-tooltip';

import { TOOLTIP_ID } from '~/types';

import { Tooltip } from '../base';

interface Props extends Omit<ITooltip, 'id'> {
  id?: TOOLTIP_ID;
}

export const TooltipCommingSoon = ({ id, ...rest }: Props) => {
  return (
    <Tooltip {...rest} id={id ?? TOOLTIP_ID.COMMING_SOON}>
      Coming soon
    </Tooltip>
  );
};
