import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import tw, { styled } from 'twin.macro';
import { Address } from 'viem';
import { useBalance } from 'wagmi';

import { useEnterOrExitMarketPrepare } from '~/api/api-contract/_evm/lending/enter-exit-market-substrate';
import { useGetHypotheticalAccount } from '~/api/api-contract/_evm/lending/get-hypothetical-Account';
import { useUserAllTokenBalances } from '~/api/api-contract/balance/user-all-token-balances';
import { useEnterOrExitMarket } from '~/api/api-contract/lending/enter-exit-market';
import { useGetAllMarkets } from '~/api/api-contract/lending/get-all-markets';
import { useUserAccountSnapshotAll } from '~/api/api-contract/lending/user-account-snapshot-all';

import { COLOR } from '~/assets/colors';
import { IconCancel, IconCheck, IconLink, IconTime } from '~/assets/icons';

import { SCANNER_URL, THOUSAND } from '~/constants';

import { AlertMessage } from '~/components/alerts';
import { ButtonPrimaryLarge } from '~/components/buttons';
import { List } from '~/components/lists';
import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { DATE_FORMATTER, formatNumber, getNetworkFull } from '~/utils';
import { calcHealthFactor } from '~/utils/util-lending';
import { useEnterOrExitMarketNetworkFeeErrorStore } from '~/states/contexts/network-fee-error/network-fee-error';
import { NETWORK, POPUP_ID } from '~/types';

interface Params {
  asset: {
    symbol: string;
    image: string;
    balance?: number;
    value?: number;
  };
  address: Address;
}
interface Props {
  type: 'enable' | 'disable';
  handleSuccess?: () => void;
}

export const PopupCollateral = ({ type, handleSuccess }: Props) => {
  const { ref } = useGAInView({ name: 'lending-enable-collateral-popup' });
  const { gaAction } = useGAAction();
  const navigate = useNavigate();
  const { network } = useParams();
  const { isEvm, isFpass, selectedNetwork } = useNetwork();
  const { evm, fpass } = useConnectedWallet();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const walletAddress = isFpass ? fpass.address : evm.address;

  const { data: nativeBalance } = useBalance({ address: walletAddress as Address });
  const { userAllTokenBalances } = useUserAllTokenBalances();
  const xrp = userAllTokenBalances?.find(t => t.symbol === 'XRP');
  const xrpBalance = xrp?.balance || 0;

  const userTokenBalance = xrpBalance || 0;

  const isEnable = type === 'enable';
  const popupId = isEnable
    ? POPUP_ID.LENDING_SUPPLY_ENABLE_COLLATERAL
    : POPUP_ID.LENDING_SUPPLY_DISABLE_COLLATERAL;

  const { error: enterOrExitGasError, setError: setEnterOrExitGasError } =
    useEnterOrExitMarketNetworkFeeErrorStore();

  const { t } = useTranslation();
  const { isMD } = useMediaQuery();
  const { params: _params, close } = usePopup(popupId);

  const params = _params as Params;
  const { symbol, image, balance, value } = params?.asset || {};
  const marketAddress = params?.address || '0x0';

  const { markets: markets } = useGetAllMarkets();
  const { accountSnapshots: snapshots } = useUserAccountSnapshotAll();
  const mTokenBalance = snapshots?.find(s => s.mTokenAddress === marketAddress)?.mTokenBalance;
  const { shortfall: hypotheticalShortfall } = useGetHypotheticalAccount({
    mTokenAddress: marketAddress,
    redeemAmount: mTokenBalance || 0n,
    borrowAmount: 0n,
  });

  const healthFactor = calcHealthFactor({ markets, snapshots });

  const [estimatedEnterOrExitMarketFee, setEstimatedEnterOrExitMarketFee] = useState<
    number | undefined
  >();

  const isExitPossible = !!(hypotheticalShortfall === 0n);
  const {
    isLoading,
    isSuccess: enterOrExitSuccess,
    isError: enterOrExitError,
    txData,
    blockTimestamp,
    writeAsync,
    estimateFee: enterOrExitEstimateFee,
  } = useEnterOrExitMarket({
    marketAddress,
    currentStatus: isEnable ? 'disable' : 'enable',
    enabled:
      marketAddress !== '0x0' &&
      ((!isEnable && isExitPossible) || isEnable) &&
      (healthFactor || 0) > 1.001,
  });

  const { isPrepareLoading, isPrepareError } = useEnterOrExitMarketPrepare({
    marketAddress,
    currentStatus: isEnable ? 'disable' : 'enable',
    enabled:
      marketAddress !== '0x0' &&
      ((!isEnable && isExitPossible) || isEnable) &&
      (healthFactor || 0) > 1.001,
  });

  const txDate = new Date(blockTimestamp || 0);
  const isIdle = !txData || !(enterOrExitError || enterOrExitSuccess);
  const isSuccess = enterOrExitSuccess && !!txData;
  const isError = enterOrExitError;
  const estimatedFee = estimatedEnterOrExitMarketFee;
  const gasError = (userTokenBalance || 0) <= Number(estimatedFee || 2) || enterOrExitGasError;

  const buttonText = useMemo(() => {
    if (isLoading) return t('Confirm in wallet');
    if (!isIdle) {
      if (isSuccess) return t('Return to lending page');
      return t('Try again');
    }
    return t(isEnable ? 'enable-collateral-button' : 'disable-collateral-button', {
      symbol,
    });
  }, [isEnable, isIdle, isLoading, isSuccess, symbol, t]);

  const handleButtonClick = async () => {
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

    gaAction({
      action: 'lending-set-collateral',
      data: {
        component: 'collateral-popup',
        marketAddress,
        isExitPossible,
        isEnable,
        currentStatus: isEnable ? 'disable' : 'enable',
        estimatedFee,
        walletAddress,
        xrpBalance: nativeBalance,
      },
    });
    await writeAsync?.();
  };

  const handleLink = () => {
    const txHash = isFpass ? txData?.extrinsicId : txData?.transactionHash;
    const url = `${SCANNER_URL[currentNetwork || NETWORK.THE_ROOT_NETWORK]}/${
      isFpass ? 'extrinsics' : isEvm ? 'tx' : 'transactions'
    }/${txHash}`;

    gaAction({
      action: 'go-to-transaction',
      data: { component: `${type}-collateral-popup`, txHash: txHash, link: url },
    });

    window.open(url);
  };

  useEffect(() => {
    if (marketAddress == '0x0') return;

    const enterOrExitEstimateFeeAsync = async () => {
      const fee = await enterOrExitEstimateFee?.();
      setEstimatedEnterOrExitMarketFee(fee || 1);
    };
    enterOrExitEstimateFeeAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isSuccess) {
      handleSuccess?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  useEffect(() => {
    return () => {
      setEnterOrExitGasError(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            disabled={
              (isIdle && gasError) ||
              !estimatedFee ||
              isPrepareLoading ||
              isPrepareError ||
              healthFactor <= 1.001 ||
              !(!isEnable && isExitPossible)
            }
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
                title={`${formatNumber(balance, 4, 'floor', THOUSAND, 0)} ${symbol}`}
                description={`$${formatNumber(value)}`}
                image={image}
                leftAlign
              />
            </List>
            <Scanner onClick={() => handleLink()}>
              <IconTime width={20} height={20} fill={COLOR.NEUTRAL[40]} />
              <ScannerText> {format(new Date(txDate), DATE_FORMATTER.FULL)}</ScannerText>
              <IconLink width={20} height={20} fill={COLOR.NEUTRAL[40]} />
            </Scanner>
          </InnerWrapper>
        )}

        {!isIdle && isError && (
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
            {healthFactor <= 1.001 ? (
              <AlertMessage
                type="error"
                title={t('health-factor-below-warning-title-collateral')}
              />
            ) : (
              <AlertMessage
                type="error"
                title={t(isEnable ? 'enable-collateral-alert' : 'disable-collateral-alert')}
              />
            )}
            <List title={'Supply balance'}>
              <TokenList
                type="large"
                title={`${formatNumber(balance, 4, 'floor', THOUSAND, 0)} ${symbol}`}
                description={`$${formatNumber(value)}`}
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
