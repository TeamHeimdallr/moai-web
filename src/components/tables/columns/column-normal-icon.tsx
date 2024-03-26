import { HTMLAttributes, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconDiamond, IconFarming, IconTokenMoai, IconTokenRoot } from '~/assets/icons';

import { Tooltip } from '~/components/tooltips/base';

import { useNetwork } from '~/hooks/contexts/use-network';
import { NETWORK, TOOLTIP_ID } from '~/types';

interface Props extends HTMLAttributes<HTMLDivElement> {
  value: ReactNode;
  value2?: ReactNode;

  network?: NETWORK;
  align?: 'flex-start' | 'center' | 'flex-end';
}
export const TableColumnApr = ({ value, value2, network, align, ...rest }: Props) => {
  const { t } = useTranslation();
  const [hover1, setHover1] = useState(false);
  const [hover2, setHover2] = useState(false);

  const { selectedNetwork } = useNetwork();

  const showMoaiPoint =
    selectedNetwork === NETWORK.THE_ROOT_NETWORK && network === NETWORK.THE_ROOT_NETWORK;

  return (
    <Wrapper align={align} {...rest}>
      <InnerWrapper>
        {value}
        {showMoaiPoint && (
          <>
            <IconWrapper
              hover={hover1}
              onMouseOver={() => setHover1(true)}
              onMouseOut={() => setHover1(false)}
              data-tooltip-id={TOOLTIP_ID.MOAI_POINT_APR}
            >
              <IconDiamond width={24} height={24} />
            </IconWrapper>
          </>
        )}
      </InnerWrapper>
      {!!value2 && (
        <InnerWrapper>
          {value2}
          <IconWrapper
            color={COLOR.GREEN[50]}
            hover={hover2}
            onMouseOver={() => setHover2(true)}
            onMouseOut={() => setHover2(false)}
            data-tooltip-id={TOOLTIP_ID.MOAI_FARM_APR}
          >
            <IconFarming width={24} height={24} fill={COLOR.GREEN[50]} />
          </IconWrapper>
        </InnerWrapper>
      )}

      <TooltipWrapper>
        <Tooltip place="bottom" id={TOOLTIP_ID.MOAI_POINT_APR} style={{ boxShadow: 'none' }}>
          <TooltipContent>
            {`+ ${t('Moai Points')}`}
            <IconTokenMoai width={16} height={16} />
          </TooltipContent>
        </Tooltip>
      </TooltipWrapper>

      <TooltipWrapper>
        <Tooltip place="bottom" id={TOOLTIP_ID.MOAI_FARM_APR} style={{ boxShadow: 'none' }}>
          <TooltipContent>
            {`+ ${t('Farming Incentives')}`}
            <IconTokenRoot width={16} height={16} />
          </TooltipContent>
        </Tooltip>
      </TooltipWrapper>
    </Wrapper>
  );
};

interface WrapperProps {
  align?: 'flex-start' | 'center' | 'flex-end';
}
const Wrapper = styled.div<WrapperProps>(({ align }) => [
  tw`flex flex-col justify-center w-full font-r-16 text-neutral-100 gap-4`,
  align &&
    css`
      align-items: ${align};
    `,
]);

const InnerWrapper = tw.div`
  flex items-center gap-4
`;

const TooltipWrapper = tw.div`
  absolute
`;
const TooltipContent = tw.div`
  flex items-center gap-4
`;

interface IconWrapperProps {
  hover?: boolean;
  color?: string;
}
const IconWrapper = styled.div<IconWrapperProps>(({ hover, color = '#f5ff83' }) => [
  tw`w-24 h-24 flex-center flex-shrink-0`,
  hover &&
    css`
      & > svg {
        filter: drop-shadow(0px 0px 12px ${color});
      }
    `,
]);
