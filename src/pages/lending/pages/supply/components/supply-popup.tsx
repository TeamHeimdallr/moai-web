import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import tw, { styled } from 'twin.macro';
import { Address, parseUnits } from 'viem';
import { useWalletClient } from 'wagmi';

import { useUserFeeTokenBalance } from '~/api/api-contract/balance/user-fee-token-balance';
import { useLendingSupply } from '~/api/api-contract/lending/supply';
import { useApprove } from '~/api/api-contract/token/approve';

import { COLOR } from '~/assets/colors';
import { IconAddToken, IconCancel, IconCheck, IconLink, IconTime } from '~/assets/icons';

import { ROOT_ASSET_ID, SCANNER_URL, THOUSAND, TRILLION } from '~/constants';

import { ButtonPrimaryLarge, ButtonPrimaryMediumIconLeading } from '~/components/buttons';
import { FeeProxySelector } from '~/components/fee-proxy-selector';
import { List } from '~/components/lists';
import { LoadingStep } from '~/components/loadings/step';
import { Popup } from '~/components/popup';
import { Token } from '~/components/token';
import { TokenList } from '~/components/token-list';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { DATE_FORMATTER, formatNumber, getNetworkFull } from '~/utils';
import {
  useApproveNetworkFeeErrorStore,
  useLendingSupplyNetworkFeeErrorStore,
} from '~/states/contexts/network-fee-error/network-fee-error';
import { useFeeTokenStore } from '~/states/data/fee-proxy';
import { IToken, NETWORK, POPUP_ID } from '~/types';

interface Props {
  tokenIn?: IToken & { balance: number; amount: number; mTokenAddress: Address };

  userTokenBalance?: number;
  apy?: number;
  collateral?: boolean;
  availableSupply?: number;

  refetchBalance?: () => void;
  handleSuccess?: () => void;
}

export const LendingSupplyPopup = ({
  tokenIn,

  userTokenBalance,
  apy,
  collateral,
  availableSupply,

  refetchBalance,
  handleSuccess,
}: Props) => {
  const { ref } = useGAInView({ name: 'lending-supply-popup' });
  const { gaAction } = useGAAction();

  const { data: walletClient } = useWalletClient();

  const { error: lendingGasError, setError: setLendingSupplyGasError } =
    useLendingSupplyNetworkFeeErrorStore();
  const { error: approveGasError, setError: setApproveGasError } = useApproveNetworkFeeErrorStore();

  const { feeToken, setFeeToken, isNativeFee } = useFeeTokenStore();
  const { userFeeTokenBalanace: userFeeToken } = useUserFeeTokenBalance();
  const userFeeTokenBalance = userFeeToken?.balance || 0;

  const { network, address: addressParams } = useParams();
  const currentNetwork = getNetworkFull(network);

  const navigate = useNavigate();

  const { t } = useTranslation();

  const { isEvm, isFpass, selectedNetwork } = useNetwork();
  const { evm, fpass } = useConnectedWallet();
  const walletAddress = isFpass ? fpass.address : evm.address;

  const { close } = usePopup(POPUP_ID.LENDING_SUPPLY);

  const isRoot = currentNetwork === NETWORK.THE_ROOT_NETWORK;

  const { isMD } = useMediaQuery();

  const [estimatedLendingSupplyFee, setEstimatedLendingSupplyFee] = useState<number | undefined>();
  const [estimatedTokenApproveFee, setEstimatedTokenApproveFee] = useState<number | undefined>();

  const assetAddress = addressParams as Address;
  const { symbol, mTokenAddress, address, amount, currency, decimal, balance, price, image } =
    tokenIn || {};

  const {
    allow,
    allowance,
    isLoading: allowLoading,
    isSuccess: allowSuccess,
    refetch: refetchAllowance,
    estimateFee: estimateTokenApproveFee,
  } = useApprove({
    amount: parseUnits(`${(amount || 0).toFixed(18)}`, decimal || 18),
    symbol: symbol || '',
    address: address || '',
    issuer: address || '',
    spender: assetAddress,
    currency: currency || '',
    enabled: !!amount && amount > 0,
  });

  const {
    isLoading: supplyLoading,
    isSuccess: supplySuccess,
    isError: supplyError,
    txData,
    blockTimestamp,
    writeAsync,
    estimateFee: estimateLendingSupplyFee,
  } = useLendingSupply({
    token: tokenIn,
    enabled: !!tokenIn && allowance && !!amount && amount > 0 && !!mTokenAddress,
  });

  const txDate = new Date(blockTimestamp || 0);
  const isIdle = !txData || !(supplyError || supplySuccess);
  const isSuccess = supplySuccess && !!txData;
  const isError = supplyError;
  const isLoading = supplyLoading || allowLoading;

  const step = allowance ? 2 : 1;
  const stepLoading = step === 1 ? allowLoading : supplyLoading;

  const buttonText = useMemo(() => {
    if (!isIdle) {
      if (isSuccess) return t('Return to lending detail page');
      return t('Try again');
    }

    if (!allowance)
      return allowLoading
        ? t('approve-loading')
        : t('approve-lending-supply-token-message', { token: symbol });

    return supplyLoading
      ? t('lending-supply-button-loading')
      : t('lending-supply-button', { token: symbol });
  }, [allowLoading, allowance, isIdle, isSuccess, supplyLoading, symbol, t]);

  const isValid =
    (amount || 0) > (userTokenBalance || 0) || (amount || 0) <= (availableSupply || 0);
  const handleButtonClick = async () => {
    if (isLoading || !isValid) return;

    if (!isIdle) {
      gaAction({
        action: 'go-to-lending-detail-page',
        data: {
          component: 'lending-supply-popup',
          link: `lending/${network}/${addressParams}`,
        },
      });

      close();
      navigate(`/lending/${network}/${addressParams}`);
      return;
    }

    if (!allowance) {
      gaAction({
        action: 'approve-token',
        data: { component: 'lending-supply-popup', token: symbol, amount, balance },
      });

      await allow();
      return;
    }

    gaAction({
      action: 'lending-supply',
      data: {
        component: 'lending-supply-popup',
        tokenIn,
        amount,
        mTokenAddress,
        estimatedFee,
        walletAddress,
        userFeeTokenBalance,
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
      data: { component: 'lending-supply-popup', txHash: txHash, link: url },
    });

    window.open(url);
  };

  useEffect(() => {
    if (allowSuccess) refetchAllowance();
  }, [allowSuccess, refetchAllowance]);

  useEffect(() => {
    if (isSuccess) {
      handleSuccess?.();
      refetchBalance?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, refetchBalance]);

  useEffect(() => {
    return () => {
      setLendingSupplyGasError(false);
      setApproveGasError(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (step !== 1 || (amount || 0) <= 0) return;

    setEstimatedTokenApproveFee(0);
    const estimateApproveFeeAsync = async () => {
      const fee = await estimateTokenApproveFee?.();
      setEstimatedTokenApproveFee(fee || 1);
    };
    estimateApproveFeeAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, step, feeToken]);

  useEffect(() => {
    if (step !== 2 || (amount || 0) <= 0) return;

    setEstimatedLendingSupplyFee(0);
    const estimateLendingSupplyFeeAsync = async () => {
      const fee = await estimateLendingSupplyFee?.();
      setEstimatedLendingSupplyFee(fee || 1);
    };
    estimateLendingSupplyFeeAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, step, feeToken]);

  const estimatedFee = step === 1 ? estimatedTokenApproveFee : estimatedLendingSupplyFee;
  const validMaxFeeTokenAmount =
    symbol === feeToken.name ? (amount || 0) + Number(estimatedFee || 4) < (balance || 0) : true;

  const gasError =
    (balance || 0) <= Number(estimatedFee || 4) ||
    lendingGasError ||
    approveGasError ||
    !validMaxFeeTokenAmount;

  const handleAddToken = async (address: Address, symbol: string) => {
    if (!address || !symbol) return;

    await walletClient?.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address,
          symbol,
          decimals: 8,
        },
      },
    });
  };

  useEffect(() => {
    setFeeToken({
      name: 'XRP',
      assetId: ROOT_ASSET_ID.XRP,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNetwork]);

  return (
    <Popup
      id={POPUP_ID.LENDING_SUPPLY}
      title={isIdle ? t('Supply preview') : ''}
      button={
        <ButtonWrapper onClick={() => handleButtonClick()}>
          <ButtonPrimaryLarge
            text={buttonText}
            isLoading={isLoading}
            buttonType={isIdle ? 'filled' : 'outlined'}
            disabled={(isIdle && gasError) || !estimatedFee}
          />
        </ButtonWrapper>
      }
      setting={isRoot && isFpass && <FeeProxySelector />}
    >
      <Wrapper style={{ gap: isIdle ? (isMD ? 24 : 20) : 40 }} ref={ref}>
        {!isIdle && isSuccess && (
          <SuccessWrapper>
            <IconWrapper>
              <IconCheck width={40} height={40} />
            </IconWrapper>
            <SuccessTitle>{t('Supply confirmed!')}</SuccessTitle>
            <SuccessSubTitle>
              {t('supply-success-message', {
                token: symbol,
                amount: formatNumber(amount, 6, 'floor', TRILLION, 0),
              })}
            </SuccessSubTitle>
          </SuccessWrapper>
        )}
        {!isIdle && isError && (
          <FailedWrapper style={{ paddingBottom: '24px' }}>
            <FailedIconWrapper>
              <IconCancel width={40} height={40} />
            </FailedIconWrapper>
            <SuccessTitle>{t('Supply failed', { token: symbol })}</SuccessTitle>
            <SuccessSubTitle>{t('supply-failed-message', { token: symbol })}</SuccessSubTitle>
          </FailedWrapper>
        )}
        {isIdle && (
          <List title={t(`You're providing`)}>
            <TokenList
              type="large"
              title={`${formatNumber(amount, 6, 'floor', TRILLION, 0)} ${symbol}`}
              description={`$${formatNumber(
                (amount || 0) * (price || 0),
                2,
                'floor',
                TRILLION,
                0
              )}`}
              image={image}
              leftAlign
            />
          </List>
        )}
        {!isIdle && isSuccess && (
          <SuccessContentWrapper>
            <SuccessContentToken>
              <Token type="large" token={`m${symbol}` || ''} imageUrl={image} />
              {t('add-token', { token: `m${symbol}` })}
            </SuccessContentToken>
            <ButtonPrimaryMediumIconLeading
              icon={<IconAddToken />}
              text={t('Add to wallet')}
              buttonType="outlined"
              onClick={() => handleAddToken(mTokenAddress ?? '0x', `m${symbol}`)}
            />
          </SuccessContentWrapper>
        )}
        {!isIdle && isSuccess && (
          <Scanner onClick={() => handleLink()}>
            <IconTime width={20} height={20} fill={COLOR.NEUTRAL[40]} />
            <ScannerText> {format(new Date(txDate), DATE_FORMATTER.FULL)}</ScannerText>
            <IconLink width={20} height={20} fill={COLOR.NEUTRAL[40]} />
          </Scanner>
        )}
        {isIdle && (
          <>
            <List title={t(`Summary`)}>
              <ListInnerWrapper>
                <Summary>
                  <SummaryTextTitle>{t('Supply APY')}</SummaryTextTitle>
                  <SummaryText>{`${formatNumber(apy, 2, 'floor', THOUSAND, 2)}%`}</SummaryText>
                </Summary>
                <Summary>
                  <SummaryTextTitle>{t('Collateralization')}</SummaryTextTitle>
                  <SummaryText style={{ color: collateral ? COLOR.GREEN[50] : COLOR.RED[50] }}>
                    {collateral ? (
                      <IconCheck width={20} height={20} fill={COLOR.GREEN[50]} />
                    ) : (
                      <IconCancel width={20} height={20} fill={COLOR.RED[50]} />
                    )}
                    {collateral ? t('Can be collateral') : t('Can not be collateral')}
                  </SummaryText>
                </Summary>
                <Divider />
                <GasFeeWrapper>
                  <GasFeeInnerWrapper>
                    <GasFeeTitle>{t(`Gas fee`)}</GasFeeTitle>
                    <GasFeeTitleValue>
                      {estimatedFee
                        ? `~${formatNumber(estimatedFee)} ${feeToken.name}`
                        : t('calculating...')}
                    </GasFeeTitleValue>
                  </GasFeeInnerWrapper>
                  <GasFeeInnerWrapper>
                    <GasFeeCaption error={gasError}>
                      {gasError
                        ? isNativeFee
                          ? t(`Not enough balance to pay for Gas Fee.`)
                          : t(`fee-proxy-error-message`, { token: feeToken.name })
                        : t(`May change when network is busy`)}
                    </GasFeeCaption>
                  </GasFeeInnerWrapper>
                </GasFeeWrapper>
              </ListInnerWrapper>
            </List>

            <LoadingStep totalSteps={2} step={step} isLoading={stepLoading} isDone={isSuccess} />
          </>
        )}
      </Wrapper>
    </Popup>
  );
};

const Divider = tw.div`
  w-full h-1 flex-shrink-0 bg-neutral-20
`;

const Wrapper = tw.div`
  flex flex-col gap-20 px-20 py-0
  md:(gap-24 px-24)
`;

const ListInnerWrapper = tw.div`
  flex flex-col gap-12 py-12 px-16
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

const Summary = tw.div`
  flex justify-between bg-neutral-15 gap-16
`;

const SummaryTextTitle = tw.div`
  text-neutral-100 font-r-14
`;

const SummaryText = tw.div`
  text-neutral-100 font-m-14 flex items-center gap-4
`;

const ButtonWrapper = tw.div`
  mt-16 w-full
`;

const Scanner = tw.div`
  flex items-start gap-4 clickable
`;

const ScannerText = tw.div`
  font-r-12 text-neutral-60
`;

const GasFeeWrapper = tw.div`
  flex-col
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

const SuccessContentWrapper = tw.div`
  flex-center flex-col gap-12 p-16 bg-neutral-15 rounded-8
`;

const SuccessContentToken = tw.div`
  flex-center flex-col gap-8 font-r-16 text-neutral-80
`;
