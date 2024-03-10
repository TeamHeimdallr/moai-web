import { HTMLAttributes, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import tw, { css, styled } from 'twin.macro';

import { IconDiamond, IconTokenMoai } from '~/assets/icons';

import { Tooltip } from '~/components/tooltips/base';

import { useNetwork } from '~/hooks/contexts/use-network';
import { NETWORK, TOOLTIP_ID } from '~/types';

interface Props extends HTMLAttributes<HTMLDivElement> {
  value: ReactNode;
  network?: NETWORK;
  align?: 'flex-start' | 'center' | 'flex-end';
}
export const TableColumnApr = ({ value, network, align, ...rest }: Props) => {
  const { t } = useTranslation();
  const [hover, setHover] = useState(false);

  const { selectedNetwork } = useNetwork();
  const showPoint =
    selectedNetwork === NETWORK.THE_ROOT_NETWORK && network === NETWORK.THE_ROOT_NETWORK;

  return (
    <Wrapper align={align} {...rest}>
      {value}

      {showPoint && (
        <>
          <IconWrapper
            hover={hover}
            onMouseOver={() => setHover(true)}
            onMouseOut={() => setHover(false)}
            data-tooltip-id={TOOLTIP_ID.MOAI_POINT_APR}
          >
            <IconDiamond width={24} height={24} />
          </IconWrapper>

          <TooltipWrapper>
            <Tooltip place="bottom" id={TOOLTIP_ID.MOAI_POINT_APR} style={{ boxShadow: 'none' }}>
              <TooltipContent>
                {`+ ${t('Moai Points')}`}
                <IconTokenMoai width={16} height={16} />
              </TooltipContent>
            </Tooltip>
          </TooltipWrapper>
        </>
      )}
    </Wrapper>
  );
};

interface WrapperProps {
  align?: 'flex-start' | 'center' | 'flex-end';
}
const Wrapper = styled.div<WrapperProps>(({ align }) => [
  tw`flex items-center justify-start w-full font-r-16 text-neutral-100 gap-4`,
  align &&
    css`
      justify-content: ${align};
    `,
]);

const TooltipWrapper = tw.div`
  absolute
`;
const TooltipContent = tw.div`
  flex items-center gap-4
`;

interface IconWrapperProps {
  hover?: boolean;
}
const IconWrapper = styled.div<IconWrapperProps>(({ hover }) => [
  tw`w-24 h-24 flex-center flex-shrink-0`,
  hover &&
    css`
      & > svg {
        filter: drop-shadow(0px 0px 12px #f5ff83);
      }
    `,
]);
