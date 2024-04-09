import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import tw from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconCancel, IconCheck, IconLink, IconNext, IconTime } from '~/assets/icons';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { List } from '~/components/lists';
import { Popup } from '~/components/popup';

import { DATE_FORMATTER } from '~/utils';
import { POPUP_ID } from '~/types';

interface Props {
  status: 'success' | 'error';

  currentTradingFee?: number;
  nextTradingFee?: number;

  proposedFee?: number;
  txDate?: Date;

  handleSuccess?: () => void;
  handleTryAgain?: () => void;

  goToScanner?: () => void;
}

export const VotingPopup = ({
  status,
  currentTradingFee,
  nextTradingFee,
  proposedFee,
  txDate,

  handleSuccess,
  handleTryAgain,
  goToScanner,
}: Props) => {
  const { t } = useTranslation();

  const isSuccess = status === 'success';

  return (
    <Popup
      id={POPUP_ID.XRPL_FEE_VOTING}
      title={''}
      button={
        <ButtonWrapper>
          <ButtonPrimaryLarge
            text={isSuccess ? t('Confirm') : t('Try again')}
            buttonType={'outlined'}
            onClick={isSuccess ? handleSuccess : handleTryAgain}
          />
        </ButtonWrapper>
      }
    >
      <Wrapper style={{ gap: 40 }}>
        {isSuccess && (
          <SuccessWrapper>
            <IconWrapper>
              <IconCheck width={40} height={40} />
            </IconWrapper>
            <SuccessTitle>{t('Vote confirmed!')}</SuccessTitle>
            <SuccessSubTitle>{t('vote-success-message')}</SuccessSubTitle>
          </SuccessWrapper>
        )}
        {!isSuccess && (
          <FailedWrapper style={{ paddingBottom: '24px' }}>
            <FailedIconWrapper>
              <IconCancel width={40} height={40} />
            </FailedIconWrapper>
            <SuccessTitle>{t('Vote failed')}</SuccessTitle>
            <SuccessSubTitle>{t('vote-fail-message')}</SuccessSubTitle>
          </FailedWrapper>
        )}

        {isSuccess && (
          <List title={t(`Summary`)}>
            <Summary>
              <InfoWrapper>
                <InfoTitle> {t('Trading fee')}</InfoTitle>
                <InfoValue>
                  <span
                    style={{ fontWeight: 700, color: COLOR.NEUTRAL[80] }}
                  >{`${currentTradingFee}%`}</span>
                  <IconNext width={12} height={12} fill={COLOR.NEUTRAL[60]} />
                  <span style={{ fontWeight: 700 }}>{`${nextTradingFee}%`}</span>
                </InfoValue>
              </InfoWrapper>
              <InfoWrapper>
                <InfoTitle> {t('Your proposed fee')}</InfoTitle>
                <InfoValue>{`${proposedFee}%`}</InfoValue>
              </InfoWrapper>
            </Summary>
          </List>
        )}

        {isSuccess && (
          <Scanner>
            <IconTime width={20} height={20} fill={COLOR.NEUTRAL[40]} />
            <ScannerText>
              {format(txDate ? new Date(txDate) : new Date(), DATE_FORMATTER.FULL)}
            </ScannerText>
            <IconLink width={20} height={20} fill={COLOR.NEUTRAL[40]} onClick={goToScanner} />
          </Scanner>
        )}
      </Wrapper>
    </Popup>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-20 px-20 py-0
  md:(gap-24 px-24)
`;

const ButtonWrapper = tw.div`
  mt-16 w-full
`;

const SuccessTitle = tw.div`
  text-neutral-100 font-b-20
  md:font-b-24
`;

const SuccessSubTitle = tw.div`
  text-neutral-80 font-r-14 text-center
  md:font-r-16
`;

const SuccessWrapper = tw.div`
  flex-center flex-col gap-12
`;

const FailedWrapper = tw.div`
  flex-center flex-col gap-12
`;

const FailedIconWrapper = tw.div`
  flex-center w-48 h-48 rounded-full bg-red-50
`;

const IconWrapper = tw.div`
  flex-center w-48 h-48 rounded-full bg-green-50
`;

const Summary = tw.div`
  flex flex-col gap-12 px-16 py-12
`;

const InfoWrapper = tw.div`
  flex items-center justify-between 
`;

const InfoTitle = tw.div`
  font-r-14 text-neutral-100 flex-1
`;

const InfoValue = tw.div`
  font-m-14 text-neutral-100 flex items-center gap-4
`;

const Scanner = tw.div`
  flex items-start gap-4 clickable
`;

const ScannerText = tw.div`
  font-r-12 text-neutral-60
`;
