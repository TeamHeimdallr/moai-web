import { ITooltip } from 'react-tooltip';
import tw from 'twin.macro';

import { Tooltip } from '~/components/tooltips/base';

import { TOOLTIP_ID } from '~/types';

interface Props extends Omit<ITooltip, 'id'> {
  id?: TOOLTIP_ID;
  address?: string;
}

export const TooltipAddress = ({ id, address, ...rest }: Props) => {
  return (
    <Tooltip {...rest} id={id ?? TOOLTIP_ID.ADDRESS} opacity={1} place={'bottom'}>
      <Wrapper>
        <Description>{address}</Description>
      </Wrapper>
    </Tooltip>
  );
};

const Wrapper = tw.div`flex flex-col w-290`;
const Description = tw.div`font-m-14 break-words address`;
