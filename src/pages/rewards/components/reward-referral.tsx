import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import copy from 'copy-to-clipboard';
import tw from 'twin.macro';

import { useGetRewardsRefereesQuery } from '~/api/api-server/rewards/get-referees';
import { useGetRewardsReferralCodeQuery } from '~/api/api-server/rewards/get-referral-code';
import { useGetRewardsWaveNInfoQuery } from '~/api/api-server/rewards/get-reward-info-waveN';
import { useGetWaveQuery } from '~/api/api-server/rewards/get-waves';

import { IconCopy } from '~/assets/icons';

import { ButtonIconSmall, ButtonPrimarySmall } from '~/components/buttons';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr, getNetworkFull } from '~/utils';
import { NETWORK, POPUP_ID } from '~/types';

import { useRewardSelectWaveIdStore } from '../states';

import { RewardReferralSharePopup } from './reward-referral-share-popup';

export const RewardReferral = () => {
  const { t } = useTranslation();

  const { network } = useParams();
  const { isFpass, selectedNetwork } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);

  const [text, setText] = useState('');

  const { open: openBindReferral } = usePopup(POPUP_ID.REWARD_BIND_REFERRAL);
  const { open: openBoundReferral } = usePopup(POPUP_ID.REWARD_BOUND_REFERRAL);
  const { opened: referralShareOpened, open: openReferralShare } = usePopup(
    POPUP_ID.REWARD_REFERRAL_SHARE
  );

  const { selectedWaveId } = useRewardSelectWaveIdStore();

  const { evm, fpass } = useConnectedWallet();
  const evmAddress = isFpass ? fpass.address : evm?.address || '';

  const { data: wave } = useGetWaveQuery(
    { params: { networkAbbr: currentNetworkAbbr } },
    {
      enabled: selectedNetwork === NETWORK.THE_ROOT_NETWORK,
      staleTime: 20 * 1000,
    }
  );
  const { waves } = wave || {};
  const currentWave = waves?.find(wave => wave.id === selectedWaveId);

  const { data: refereesData } = useGetRewardsRefereesQuery(
    {
      params: { networkAbbr: currentNetworkAbbr },
      queries: {
        wave: currentWave?.waveId || 0,
        walletAddress: evmAddress,
      },
    },
    {
      enabled:
        selectedNetwork === NETWORK.THE_ROOT_NETWORK && !!evmAddress && !!currentWave?.waveId,
      staleTime: 20 * 1000,
    }
  );

  const { referees } = refereesData || {};

  const { data: codeData } = useGetRewardsReferralCodeQuery(
    {
      params: { networkAbbr: currentNetworkAbbr },
      queries: {
        wave: currentWave?.waveId || 0,
        walletAddress: evmAddress,
      },
    },
    {
      enabled:
        selectedNetwork === NETWORK.THE_ROOT_NETWORK && !!evmAddress && !!currentWave?.waveId,
      staleTime: 20 * 1000,
    }
  );

  const { data: myWaveInfo } = useGetRewardsWaveNInfoQuery(
    {
      params: { networkAbbr: currentNetworkAbbr },
      queries: { walletAddress: evmAddress, wave: currentWave?.waveId },
    },
    {
      enabled: currentNetwork === NETWORK.THE_ROOT_NETWORK && !!evmAddress && !!currentWave?.waveId,
      staleTime: 20 * 1000,
    }
  );
  const { referral } = myWaveInfo || {};

  const { code } = codeData || {};

  const handleCopy = () => {
    copy(code || '');

    setText('Copied!');
    setTimeout(() => setText(code || ''), 2000);
  };

  useEffect(() => {
    setText(code || '');
  }, [code]);

  return (
    <Wrapper>
      <UpperWrapper>
        <UpperInnerWrapper>
          <ContentWrapper>
            <Label>{t('My Referral Code')}</Label>
            <Label>{t('My Referees')}</Label>
          </ContentWrapper>
          <ContentWrapper>
            <Value>
              {t(text)}
              <ButtonIconSmall icon={<IconCopy />} onClick={handleCopy} />
            </Value>
            <Value>{referees || '-'}</Value>
          </ContentWrapper>
        </UpperInnerWrapper>
        {!!referral && (
          <ButtonWrapper onClick={() => openBoundReferral()}>{t('Bound Referrer')}</ButtonWrapper>
        )}
      </UpperWrapper>

      <BottomWrapper>
        <BottomContentWrapper>
          <BottomTitleWrapper>
            <BottomTitle>{t('reward-referral-share-title')}</BottomTitle>
            <BottomDescription>{t('reward-referral-share-description')}</BottomDescription>
          </BottomTitleWrapper>
          <BottomButtonWrapper>
            <ButtonPrimarySmall text={t('Share link')} onClick={() => openReferralShare()} />
          </BottomButtonWrapper>
        </BottomContentWrapper>
        {!referral && (
          <BottomContentWrapper>
            <BottomTitleWrapper>
              <BottomTitle>{t('reward-referral-bind-title')}</BottomTitle>
              <BottomDescription>{t('reward-referral-bind-description')}</BottomDescription>
            </BottomTitleWrapper>
            <BottomButtonWrapper>
              <ButtonPrimarySmall text={t('Bind referrer')} onClick={() => openBindReferral()} />
            </BottomButtonWrapper>
          </BottomContentWrapper>
        )}
      </BottomWrapper>
      {referralShareOpened && <RewardReferralSharePopup code={code || ''} />}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-16 rounded-12 bg-neutral-10 px-24 py-20
  md:(px-24 py-20)
`;

const UpperWrapper = tw.div`
  flex gap-8 items-center justify-between
`;

const UpperInnerWrapper = tw.div`
  flex flex-col gap-8 w-full
`;

const ButtonWrapper = tw.div`
  flex justify-end flex-shrink-0 font-m-12 text-primary-60 px-12 py-4 clickable
`;

const ContentWrapper = tw.div`
  flex gap-40
`;

const Label = tw.div`
  w-162 font-m-16 text-neutral-80
`;

const Value = tw.div`
  w-162 flex items-center gap-4 font-m-20 text-neutral-100
`;

const BottomWrapper = tw.div`
  flex gap-16
`;

const BottomContentWrapper = tw.div`
  w-full flex flex-col items-start justify-between gap-16 bg-neutral-5 rounded-8 px-20 pt-16 pb-20
`;

const BottomTitleWrapper = tw.div`
  flex flex-col gap-4
`;

const BottomTitle = tw.div`
  font-m-16 text-primary-50
`;

const BottomDescription = tw.div`
  font-r-14 text-neutral-80
`;

const BottomButtonWrapper = tw.div`
  flex justify-start items-center
`;
