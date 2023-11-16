import { ITooltip } from 'react-tooltip';
import tw from 'twin.macro';

import { Tooltip } from '~/components/tooltips/base';

import { TOOLTIP_ID } from '~/types';

interface Props extends Omit<ITooltip, 'id'> {
  id?: TOOLTIP_ID;
}

export const TooltipFuturepass = ({ id, ...rest }: Props) => {
  return (
    <Tooltip {...rest} id={id ?? TOOLTIP_ID.CAMPAIGN_FUTUREPASS} opacity={1} place={'bottom'}>
      <Wrapper>
        <Title>What is Futurepass?</Title>
        <Description>
          Futurepass is an all-in-one wallet natively used in the Futureverse.
        </Description>
      </Wrapper>
    </Tooltip>
  );
};

const Wrapper = tw.div`flex flex-col w-266`;
const Title = tw.div`font-b-14`;
const Description = tw.div`font-m-14`;
