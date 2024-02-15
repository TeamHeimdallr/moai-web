import { HTMLAttributes, ReactNode } from 'react';
import { css } from '@emotion/react';
import tw, { styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';

interface Props extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  titleIcon?: ReactNode;

  value?: ReactNode;
  caption?: string;

  barChart?: boolean;
  barChartValue?: number;
  barChartLabel?: string;
}
export const AssetSupplyBorrowInfoCard = ({
  title,
  titleIcon,

  value,
  caption,

  barChart,
  barChartValue,
  barChartLabel,
  ...rest
}: Props) => {
  return (
    <Wrapper {...rest}>
      <Title>
        {title}
        {titleIcon}
      </Title>
      <ContentWrapper>
        <ValueWrapper>{value}</ValueWrapper>
        {caption && <Caption>{caption}</Caption>}
      </ContentWrapper>
      {barChart && (
        <BarWrapper>
          <Bar value={barChartValue || 0} />
          <Caption>{barChartLabel}</Caption>
        </BarWrapper>
      )}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-16 justify-start text-neutral-100
  flex-1 pr-24 pb-20
`;

const Title = tw.div`
  flex items-center gap-4 text-primary-80 font-b-14
  md:(font-b-16)
`;

const ContentWrapper = tw.div`
  flex flex-col gap-4
`;

const ValueWrapper = tw.div`
  flex gap-4 items-center
`;

const BarWrapper = tw.div`
  flex flex-col gap-4
`;

interface InfoBarProps {
  value: number;
}
const Bar = styled.div<InfoBarProps>(({ value }) => [
  tw`
    w-full h-4 bg-neutral-30 rounded-4 relative
  `,
  css`
    &:after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;

      min-width: 2px;
      width: ${value > 99 ? 100 : value}%;
      height: 4px;
      background: ${COLOR.GREEN[50]};

      border-top-left-radius: ${value > 0 ? '99999px' : '0'};
      border-bottom-left-radius: ${value > 0 ? '99999px' : '0'};

      border-top-right-radius: ${value > 99 ? '99999px' : '0'};
      border-bottom-right-radius: ${value > 99 ? '99999px' : '0'};
    }
  `,
]);

const Caption = tw.div`
  text-neutral-90 font-r-12
  md:(font-r-14)
`;
