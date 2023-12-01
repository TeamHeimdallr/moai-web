import { ITooltip } from 'react-tooltip';
import tw from 'twin.macro';

import { Tooltip } from '~/components/tooltips/base';

import { TOOLTIP_ID } from '~/types';

interface Props extends Omit<ITooltip, 'id'> {
  id?: TOOLTIP_ID;
}

export const TooltipEnoughXrp = ({ id, ...rest }: Props) => {
  return (
    <Tooltip {...rest} id={id ?? TOOLTIP_ID.ENOUGH_XRP} opacity={1} place={'bottom'}>
      <Wrapper>
        <Description>
          If you already have enough $XRP in your Root Network wallet, go to the next step!{' '}
        </Description>
      </Wrapper>
    </Tooltip>
  );
};

const Wrapper = tw.div`flex flex-col w-290`;
const Description = tw.div`font-m-14`;
