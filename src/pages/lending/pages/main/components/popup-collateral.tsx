import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import tw, { styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconCancel, IconCheck, IconLink, IconTime } from '~/assets/icons';

import { AlertMessage } from '~/components/alerts';
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
  asset: {
    symbol: string;
    image: string;
    balance?: number;
    value?: number;
  };
}
interface Props {
  type: 'enable' | 'disable';
}

export const PopupCollateral = ({ type }: Props) => {
  const { ref } = useGAInView({ name: 'lending-enable-collateral-popup' });
  const { gaAction } = useGAAction();
  const navigate = useNavigate();

  const isEnable = type === 'enable';
  const popupId = isEnable
    ? POPUP_ID.LENDING_SUPPLY_ENABLE_COLLATERAL
    : POPUP_ID.LENDING_SUPPLY_DISABLE_COLLATERAL;

  const { t } = useTranslation();
  const { isMD } = useMediaQuery();
  const { params: _params, close } = usePopup(popupId);

  const params = _params as Params;
  const { symbol, image, balance, value } = params?.asset || {};

  // TODO: connect to contract
  const isIdle = true;
  const isLoading = false;
  const isSuccess = false;

  const gasError = false;
  const estimatedFee = 3.24543;
  const txDate = new Date();

  const buttonText = useMemo(() => {
    if (!isIdle) {
      if (isSuccess) return t('Return to lending page');
      return t('Try again');
    }
    return t(isEnable ? 'enable-collateral-button' : 'disable-collateral-button', {
      symbol,
    });
  }, [isEnable, isIdle, isSuccess, symbol, t]);

  const handleButtonClick = () => {
    if (isLoading) return;
    if (!isIdle) {
      if (isSuccess) {
        gaAction({
          action: 'go-to-lending-page',
          data: { component: `${type}-collateral-popup`, link: `lending` },
        });

        close();
        navigate(`/lending`);
        return;
      }

      close();
      return;
    }

    // TODO: call contract
    if (isEnable) {
      close();
      return;
    }
    close();
  };

  return (
    <Popup
      id={popupId}
      title={isIdle ? t(isEnable ? 'Enable as collateral' : 'Disable as collateral') : ''}
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
              <SuccessTitle>
                {t(isEnable ? 'Enabled collateral confirmed!' : 'Disabled collateral confirmed!')}
              </SuccessTitle>
              <SuccessSubTitle>
                {t(
                  isEnable
                    ? 'lending-enable-collateral-success'
                    : 'lending-disable-collateral-success',
                  { symbol }
                )}
              </SuccessSubTitle>
            </SuccessWrapper>
            <List title={t('Supply balance')}>
              <TokenList
                type="large"
                title={`${formatNumber(balance, 6, 'round', 100000)} ${symbol}`}
                description={`$${formatNumber(value, 4, 'round', 100000)}`}
                image={image}
                leftAlign
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
              <SuccessTitle>
                {t(isEnable ? 'Enable collateral failed' : 'Disable collateral failed')}
              </SuccessTitle>
              <SuccessSubTitle>
                {t(
                  isEnable
                    ? 'lending-enable-collateral-failed'
                    : 'lending-disable-collateral-failed'
                )}
              </SuccessSubTitle>
            </FailedWrapper>
          </InnerWrapper>
        )}

        {isIdle && (
          <InnerWrapper style={{ gap: isIdle ? (isMD ? 24 : 20) : 40 }}>
            <AlertMessage
              type="error"
              title={t(isEnable ? 'enable-collateral-alert' : 'disable-collateral-alert')}
            />
            <List title={'Supply balance'}>
              <TokenList
                type="large"
                title={`${formatNumber(balance, 6, 'round', 100000)} ${symbol}`}
                description={`$${formatNumber(value, 4, 'round', 100000)}`}
                image={image}
                leftAlign
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
  md:(gap-24 px-24)
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
