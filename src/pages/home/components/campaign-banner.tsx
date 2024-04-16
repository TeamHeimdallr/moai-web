import { useTranslation } from 'react-i18next';
import { isBefore } from 'date-fns';
import tw from 'twin.macro';

import { useClaim } from '~/api/api-contract/_evm/campaign/reward-claim';
import { useClaim as useClaimSubstrate } from '~/api/api-contract/_evm/campaign/reward-claim-substrate';
import { useUserCampaignInfo } from '~/api/api-contract/_evm/campaign/user-campaign-info.ts';

import { COLOR } from '~/assets/colors';
import { IconNext } from '~/assets/icons';
import Slogan1 from '~/assets/logos/logo-campaign-1.svg?react';
import Slogan2 from '~/assets/logos/logo-campaign-2.svg?react';

import { MILLION } from '~/constants';

import { BadgeText } from '~/components/badges';
import { ButtonPrimaryMediumIconTrailing } from '~/components/buttons';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { formatNumber } from '~/utils';

export const CampaignBanner = () => {
  const { t } = useTranslation();
  const { isFpass } = useNetwork();
  const { isMD } = useMediaQuery();

  const showCampaignBanner = isBefore(new Date(), new Date('2024-05-10T00:00:00Z'));
  const { amountFarmedInBPT, rootReward } = useUserCampaignInfo();

  /* claim */
  const claimEvm = useClaim();
  const claimSubstrate = useClaimSubstrate();

  const claim = isFpass ? claimSubstrate : claimEvm;
  const { isLoading: claimLoading, writeAsync } = claim;

  if (!showCampaignBanner || (amountFarmedInBPT <= 0 && rootReward <= 0)) return;
  return (
    <Wrapper>
      <TitleWrapper>
        <BadgeWrapper>
          <BadgeText
            text={t('Ended campaign')}
            color={COLOR.NEUTRAL[80]}
            backgroundColor={COLOR.NEUTRAL[20]}
          />
        </BadgeWrapper>
        <SloganWrapper>
          <Slogan1 height={16} />
          <Slogan2 height={16} />
        </SloganWrapper>
        {t('Campaign has concluded! Claim your rewards.')}
      </TitleWrapper>

      <InfoWrapper>
        <Info>
          <Label>{t('My liquidity')}</Label>
          <TextWrapper>
            <Text>{formatNumber(amountFarmedInBPT, isMD ? 4 : 2, 'floor', MILLION, 0)}</Text>
            <Caption>{'50ROOT-50XRP'}</Caption>
          </TextWrapper>
        </Info>
        <Info>
          <Label>{t('My rewards')}</Label>
          <TextWrapper>
            <Text>{formatNumber(rootReward, isMD ? 4 : 2, 'floor', MILLION, 0)}</Text>
            <Caption>{'ROOT'}</Caption>
          </TextWrapper>
        </Info>
      </InfoWrapper>

      <ButtonWrapper>
        <ButtonPrimaryMediumIconTrailing
          text={t('Claim rewards')}
          icon={<IconNext />}
          buttonType="outlined"
          onClick={writeAsync}
          disabled={!rootReward}
          isLoading={claimLoading}
        />
      </ButtonWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full px-24 py-32 flex flex-col gap-24 rounded-12
  bg-campaign bg-cover bg-top
`;

const TitleWrapper = tw.div`
  flex flex-col gap-16 font-r-14 text-neutral-100
`;

const BadgeWrapper = tw.div`
  flex items-start
`;

const SloganWrapper = tw.div`
  flex items-center gap-6
`;

const InfoWrapper = tw.div`
  grid grid-cols-2 gap-16
  md:(grid-cols-4)
`;
const Info = tw.div`
  w-full px-20 py-16 flex flex-col gap-4 rounded-12 bg-neutral-100/10 backdrop-blur-sm
`;
const Label = tw.div`
  font-m-14 text-neutral-80 leading-24
`;

const TextWrapper = tw.div`
  flex flex-col
`;
const Text = tw.div`
  font-m-20 text-neutral-100
`;
const Caption = tw.div`
  font-r-14 text-neutral-70
`;

const ButtonWrapper = tw.div`
  w-fit
`;
