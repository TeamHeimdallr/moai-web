import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import tw from 'twin.macro';

import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { imageMoai2 } from '~/assets/images';

// import { TooltipApr } from '~/components/tooltips/apr';
import { formatNumber } from '~/utils';
import { TOOLTIP_ID } from '~/types';

export const PoolInfo = () => {
  const { network, id } = useParams();
  const { t } = useTranslation();

  const queryEnabled = !!network && !!id;
  const { data } = useGetPoolQuery(
    {
      params: {
        networkAbbr: network as string,
        poolId: id as string,
      },
    },
    {
      enabled: queryEnabled,
      staleTime: 1000,
    }
  );

  const { pool } = data || {};
  const { value, volume, apr, tradingFee } = pool || {};

  const formattedValue = value ? `$${formatNumber(value, 2)}` : '$0';
  const formattedVolume = volume ? `$${formatNumber(volume, 2)}` : '$0';

  const formattedApr = apr ? `${formatNumber(apr, 4, 'round', 10000)}%` : '0%'; // swap apr
  // TODO: moai pre-mining apr
  // const formattedMoaiApr = apr ? `${formatNumber(9992.193, 4, 'round', 10000)}%` : '0%'; // moai pre-mining apr

  const formattedFees = tradingFee ? `${formatNumber(tradingFee * 100, 2)}%` : '0%';

  return (
    <Wrapper>
      <InnerWrapper>
        <PoolInfoCard name={t('Pool Value')} value={formattedValue} />
        <PoolInfoCard name={t('Volume (24h)')} value={formattedVolume} />
      </InnerWrapper>
      <InnerWrapper>
        <PoolInfoCard name={t('APR')} value={formattedApr} />
        {/* TODO: */}
        {/* <PoolInfoCard name={t('APR')} value={formattedApr} subValue={formattedMoaiApr} hoverable /> */}
        <PoolInfoCard name={t('Trading Fee')} value={formattedFees} />
      </InnerWrapper>
      {/* TODO: */}
      {/* <ToolTipWrapper>
        <TooltipApr swapApr={formattedApr} moaiApr={formattedMoaiApr} place="bottom" />
      </ToolTipWrapper> */}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex gap-16 flex-col
  md:(flex-row)
`;
const InnerWrapper = tw.div`
  flex flex-1 gap-16
`;

// const ToolTipWrapper = tw.div`
//   absolute
// `;

interface PoolInfoCardProps {
  name: string;
  value: string;

  subValue?: string;
  subValueIcon?: ReactNode;

  hoverable?: boolean;
}
const PoolInfoCard = ({
  name,
  value,
  subValue,
  subValueIcon = <MoaiIcon src={imageMoai2} />,
  hoverable,
}: PoolInfoCardProps) => {
  return (
    <PoolInfoCardWrapper>
      <Name>{name}</Name>
      <ValueWrapper data-tooltip-id={hoverable ? TOOLTIP_ID.APR : undefined}>
        <Value>{value}</Value>
        {subValue && (
          <SubValueWrapper>
            {subValue}
            {subValueIcon}
          </SubValueWrapper>
        )}
      </ValueWrapper>
    </PoolInfoCardWrapper>
  );
};
const PoolInfoCardWrapper = tw.div`
  w-full flex flex-1 flex-col items-start bg-neutral-10 rounded-12
  py-16 px-20 gap-12
  md:(py-20 px-24 gap-16)
`;

const Name = tw.div`
  font-m-14 text-neutral-80
  md:(font-m-16)
`;

const ValueWrapper = tw.div`
  flex flex-col gap-2
`;

const Value = tw.div`
  font-m-18 text-neutral-100
  md:(font-m-20)
`;

const SubValueWrapper = tw.div`
  flex items-center gap-4
  font-r-14 text-neutral-80
`;

const MoaiIcon = tw.img`
  w-16 h-16 flex-center flex-shrink-0 rounded-full overflow-hidden
`;
