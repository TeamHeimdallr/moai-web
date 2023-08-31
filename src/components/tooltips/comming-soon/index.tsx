import { ITooltip } from 'react-tooltip';

import { TOOLTIP_ID } from '~/constants';

import { Tooltip } from '../base';

interface Props extends ITooltip {}

export const TooltipCommingSoon = ({ ...rest }: Props) => {
  return (
    <Tooltip {...rest} id={TOOLTIP_ID.COMMING_SOON}>
      Comming soon
    </Tooltip>
  );
};
