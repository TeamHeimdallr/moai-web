import { useTranslation } from 'react-i18next';
import { ITooltip } from 'react-tooltip';
import tw from 'twin.macro';

import { Tooltip } from '~/components/tooltips/base';

import { TOOLTIP_ID } from '~/types';

interface Props extends Omit<ITooltip, 'id'> {
  id?: TOOLTIP_ID;
}

export const TooltipFuturepass = ({ id, ...rest }: Props) => {
  const { t } = useTranslation();

  return (
    <Tooltip {...rest} id={id ?? TOOLTIP_ID.CAMPAIGN_FUTUREPASS} opacity={1} place={'bottom'}>
      <Wrapper>
        <Title>{t('What is Futurepass?')}</Title>
        <Description>{t('futurepass-description')}</Description>
      </Wrapper>
    </Tooltip>
  );
};

const Wrapper = tw.div`
  flex flex-col w-266
`;
const Title = tw.div`
  font-b-14
`;
const Description = tw.div`
  font-m-14
`;
