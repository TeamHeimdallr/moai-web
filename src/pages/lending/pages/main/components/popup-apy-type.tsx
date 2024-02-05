import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import tw, { styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconCancel, IconCheck, IconLink, IconTime } from '~/assets/icons';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { List } from '~/components/lists';
import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { usePopup } from '~/hooks/components';
import { useMediaQuery } from '~/hooks/utils';
import { DATE_FORMATTER, formatNumber } from '~/utils';
import { POPUP_ID } from '~/types';

interface Params {
  address: string;
  type: 'variable' | 'stable';
  apy: number;
}

export const PopupApyType = () => {
  const { ref } = useGAInView({ name: 'lending-change-apy-popup' });
  const { gaAction } = useGAAction();
  const navigate = useNavigate();

  const { t } = useTranslation();
  const { isMD } = useMediaQuery();
  const { params: _params, close } = usePopup(POPUP_ID.LENDING_BORROW_CHANGE_APY_TYPE);

  const params = _params as Params;
  const { address, apy, type } = params || {};

  // TODO: connect to contract
  const isIdle = true;
  const isLoading = false;
  const isSuccess = false;

  const gasError = false;
  const estimatedFee = 3.24543;
  const txDate = new Date();

  const buttonText = useMemo(() => {
    if (isLoading) return t('Switching rate');
    if (!isIdle) {
      if (isSuccess) return t('Return to lending page');
      return t('Try again');
    }
    return t('Switch rate');
  }, [isIdle, isLoading, isSuccess, t]);

  const handleButtonClick = () => {
    if (isLoading) return;
    if (!isIdle) {
      if (isSuccess) {
        gaAction({
          action: 'go-to-lending-page',
          data: { component: 'change-apr-type-popup', address, to: type },
        });

        close();
        navigate(`/lending`);
        return;
      }

      close();
      return;
    }

    // TODO: call contract
    close();
  };

  return (
    <Popup
      id={POPUP_ID.LENDING_BORROW_CHANGE_APY_TYPE}
      title={isIdle ? t('Switch APY type') : ''}
      button={
        <ButtonWrapper onClick={() => handleButtonClick()}>
          <ButtonPrimaryLarge
            text={buttonText}
            isLoading={isLoading}
            buttonType={!isIdle && !isSuccess ? 'outlined' : 'filled'}
            disabled={(isIdle && gasError) || !estimatedFee}
          />
        </ButtonWrapper>
      }
    >
      <Wrapper ref={ref}>
        {!isIdle && isSuccess && (
          <InnerWrapper style={{ gap: isIdle ? (isMD ? 24 : 20) : 40 }}>
            <SuccessWrapper>
              <IconWrapper>
                <IconCheck width={40} height={40} />
              </IconWrapper>
              <SuccessTitle>{t('Switch confirmed!')}</SuccessTitle>
              <SuccessSubTitle>{t('lending-switch-apy-type-success', { type })}</SuccessSubTitle>
            </SuccessWrapper>
            <List title={t('Transaction overview')}>
              <TokenList
                type="medium"
                title={t('New APY')}
                balance={`${t(type)} ${formatNumber(apy, 6, 'round', 1000)}%`}
              />
            </List>
            <Scanner onClick={() => {}}>
              <IconTime width={20} height={20} fill={COLOR.NEUTRAL[40]} />
              <ScannerText> {format(new Date(txDate), DATE_FORMATTER.FULL)}</ScannerText>
              <IconLink width={20} height={20} fill={COLOR.NEUTRAL[40]} />
            </Scanner>
          </InnerWrapper>
        )}

        {!isIdle && !isSuccess && (
          <InnerWrapper
            style={{ gap: isIdle ? (isMD ? 24 : 20) : 40, paddingBottom: isMD ? '16px' : '12px' }}
          >
            <FailedWrapper>
              <FailedIconWrapper>
                <IconCancel width={40} height={40} />
              </FailedIconWrapper>
              <SuccessTitle>{t('Switch failed')}</SuccessTitle>
              <SuccessSubTitle>{t('lending-switch-apy-type-failed', { type })}</SuccessSubTitle>
            </FailedWrapper>
          </InnerWrapper>
        )}

        {isIdle && (
          <InnerWrapper style={{ gap: isIdle ? (isMD ? 24 : 20) : 40 }}>
            <List title={t('Transaction overview')}>
              <TokenList
                type="medium"
                title={t('New APY')}
                balance={`${t(type)} ${formatNumber(apy, 6, 'round', 1000)}%`}
              />
            </List>
            <GasFeeWrapper>
              <GasFeeInnerWrapper>
                <GasFeeTitle>{t(`Gas fee`)}</GasFeeTitle>
                <GasFeeTitleValue>
                  {estimatedFee ? `~${formatNumber(estimatedFee)} XRP` : t('calculating...')}
                </GasFeeTitleValue>
              </GasFeeInnerWrapper>
              <GasFeeInnerWrapper>
                <GasFeeCaption error={gasError}>
                  {gasError
                    ? t(`Not enough balance to pay for Gas Fee.`)
                    : t(`May change when network is busy`)}
                </GasFeeCaption>
              </GasFeeInnerWrapper>
            </GasFeeWrapper>
          </InnerWrapper>
        )}
      </Wrapper>
    </Popup>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-20 px-20 py-0
  md:(gap-24 px-24 pt-4)
`;

const InnerWrapper = tw.div`
  flex flex-col gap-20 py-0
  md:(gap-24)
`;

const SuccessTitle = tw.div`
  text-neutral-100 font-b-20
  md:font-b-24
`;

const SuccessSubTitle = tw.div`
  text-neutral-80 font-r-14
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

const ButtonWrapper = tw.div`
  pt-20 w-full
  md:(pt-24)
`;

const Scanner = tw.div`
  flex items-start gap-4 clickable
`;

const ScannerText = tw.div`
  font-r-12 text-neutral-60
`;

const GasFeeWrapper = tw.div`
  px-16 py-8 flex-col bg-neutral-15 rounded-12
`;

const GasFeeInnerWrapper = tw.div`
  flex gap-4
`;

const GasFeeTitle = tw.div`
  font-r-14 text-neutral-100 flex-1
`;
const GasFeeTitleValue = tw.div`
  font-m-14 text-neutral-100
`;

interface GasFeeCaptionProps {
  error?: boolean;
}
const GasFeeCaption = styled.div<GasFeeCaptionProps>(({ error }) => [
  tw`
    font-r-12 text-neutral-60 flex-1
  `,
  error && tw`text-red-50`,
]);
