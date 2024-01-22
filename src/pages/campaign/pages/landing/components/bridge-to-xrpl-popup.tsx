import { Suspense, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { format } from 'date-fns';
import tw, { css, styled } from 'twin.macro';
import { formatUnits, parseUnits } from 'viem';
import * as yup from 'yup';

import { useBridgeToXrpl } from '~/api/api-contract/_evm/campaign/bridge/bridge-root-to-xrpl';
import { useUserAllTokenBalances } from '~/api/api-contract/balance/user-all-token-balances';

import { COLOR } from '~/assets/colors';
import {
  IconArrowDown,
  IconCancel,
  IconCheck,
  IconLink,
  IconTime,
  IconTokenXrp,
} from '~/assets/icons';
import TokenXrp from '~/assets/icons/icon-token-xrp.svg';

import { SCANNER_URL } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { InputNumber } from '~/components/inputs';
import { List } from '~/components/lists';
import { Popup } from '~/components/popup';
import { ListSkeleton } from '~/components/skeleton/list-skeleton';
import { SkeletonBase } from '~/components/skeleton/skeleton-base';
import { Token } from '~/components/token';
import { TokenList } from '~/components/token-list';

import { TooltipAddress } from '~/pages/campaign/components/tooltip-address';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { DATE_FORMATTER, formatNumber, getNetworkFull } from '~/utils';
import { useBridgeToXrplNetworkFeeErrorStore } from '~/states/contexts/network-fee-error/network-fee-error';
import { useTheRootNetworkSwitchWalletStore } from '~/states/contexts/wallets/switch-wallet';
import { NETWORK, POPUP_ID, TOOLTIP_ID } from '~/types';

interface InputFormState {
  input1: number;
}

export const BridgeToXrplPopup = () => {
  return (
    <Suspense fallback={<_BridgeToXrplPopupSkeleton />}>
      <_BridgeToXrplPopup />
    </Suspense>
  );
};

const _BridgeToXrplPopup = () => {
  const { ref } = useGAInView({ name: 'campaign-bridge-to-xrpl-popup' });
  const { gaAction } = useGAAction();
  const { selectedWallet } = useTheRootNetworkSwitchWalletStore();

  const { isFpass } = useNetwork();
  const { xrp: xrpWallet, fpass, evm } = useConnectedWallet();
  const address = selectedWallet === 'fpass' ? fpass.address : evm.address;
  const truncatedAddress =
    selectedWallet === 'fpass' ? fpass.truncatedAddress : evm.truncatedAddress;

  const navigate = useNavigate();

  const { t } = useTranslation();
  const { network: networkParam } = useParams();
  const { selectedNetwork } = useNetwork();

  const [inputValue, setInputValue] = useState<number>();

  const [estimatedBridgeFee, setEstimatedBridgeFee] = useState<number | undefined>();

  const currentNetwork = getNetworkFull(networkParam) ?? selectedNetwork;

  const { error: bridgeGasError, setError: setBridgeGasError } =
    useBridgeToXrplNetworkFeeErrorStore();

  const { userAllTokenBalances } = useUserAllTokenBalances();
  const xrp = userAllTokenBalances?.find(t => t.symbol === 'XRP');
  const xrpBalance = xrp?.balance || 0;

  const { close } = usePopup(POPUP_ID.CAMPAIGN_BRIDGE_TO_XRPL);

  const validAmount = inputValue && inputValue > 0;
  const bridgeEnabled = !!validAmount;

  const schema = yup.object().shape({
    input1: yup.number().min(0).max(xrpBalance, t('Exceeds wallet balance')).required(),
  });

  const { control, setValue, formState } = useForm<InputFormState>({
    resolver: yupResolver(schema),
  });

  const xrpPrice = xrp?.price || 0;
  const bridgeTokenValue = inputValue ? inputValue * xrpPrice : 0;

  // const bridgeToXrplEvm = useWithdrawLiquidityEVM({
  //   bptIn: inputValueRaw || 0n,
  //   enabled: withdrawLiquidityEnabled && !isFpass,
  // });

  // const withdrawLiquiditySubstrate = useWithdrawLiquiditySubstrate({
  //   bptIn: inputValueRaw || 0n,
  //   enabled: withdrawLiquidityEnabled && isFpass,
  // });
  // const {
  //   isPrepareLoading: withdrawLiquiditySubstratePrepareLoading,
  //   isPrepareError: withdrawLiquiditySubstratePrepareIsError,
  //   prepareError: withdrawLiquiditySubstratePrepareError,
  // } = useWithdrawLiquidityPrepare({
  //   bptIn: inputValueRaw || 0n,
  //   enabled: withdrawLiquidityEnabled && isFpass,
  // });

  // const withdrawLiquidity = isFpass ? withdrawLiquiditySubstrate : withdrawLiquidityEvm;
  // const {
  //   isPrepareLoading: withdrawLiquidityPrepareLoading,
  //   isLoading: withdrawLiquidityLoading,
  //   isSuccess: withdrawLiquiditySuccess,
  //   isError: withdrawLiquidityIsError,
  //   error: withdrawLiquidityError,
  //   txData,
  //   blockTimestamp,
  //   writeAsync,
  //   estimateFee: estimateWithdrawLiquidityFee,
  // } = withdrawLiquidity;

  // const { lpTokenTotalSupply, refetch } = useUserPoolTokenBalances({
  //   network: 'trn',
  //   id: POOL_ID?.[selectedNetwork]?.ROOT_XRP,
  // });

  // isPrepareLoading: withdrawLiquidityPrepareLoading,
  // isLoading: withdrawLiquidityLoading,
  // isSuccess: withdrawLiquiditySuccess,
  // isError: withdrawLiquidityIsError,
  // error: withdrawLiquidityError,
  // txData,
  // blockTimestamp,
  // writeAsync,
  // estimateFee: estimateWithdrawLiquidityFee,

  const bridgeEvmSubstrate = useBridgeToXrpl({
    amount: parseUnits(inputValue?.toString() ?? '0', 6) || 0n,
    destination: xrpWallet.address,
    enabled: !!validAmount,
  });

  // TODO
  const bridgeFpassSubstrate = useBridgeToXrpl({
    amount: parseUnits(inputValue?.toString() ?? '0', 6) || 0n,
    destination: xrpWallet.address,
    enabled: !!validAmount,
  });

  const bridgeToXrpl = isFpass ? bridgeFpassSubstrate : bridgeEvmSubstrate;

  const {
    isSuccess: bridgeSuccess,
    isLoading,
    isError,
    txData,
    blockTimestamp,
    writeAsync: bridge,
    estimateFee,
  } = bridgeToXrpl;

  const isSuccess = bridgeSuccess && !!txData;
  const txDate = new Date(blockTimestamp || 0);
  const isIdle = !txData; // TODO
  // const isIdle = false; // TODO
  const estimatedFee = estimatedBridgeFee || '';
  const gasFeeBuffer = 0.05;
  const gasError =
    Math.max(xrpBalance - (inputValue ?? 0) - gasFeeBuffer, 0) <= Number(estimatedFee || 0.5) ||
    bridgeGasError;
  const invalid = isError || gasError || !estimatedFee || (inputValue || 0) <= 0;
  const invalidWithLoading = invalid || isLoading;

  const handleButtonClick = async () => {
    if (isLoading || invalidWithLoading) return;
    if (!isIdle) {
      if (isSuccess) {
        gaAction({
          action: 'go-to-campaign-page',
          data: { component: 'campaign-bridge-to-xrpl-popup', link: '/campaign' },
        });

        close();

        navigate(`/campaign`);
        return;
      }
      close();
      return;
    }

    gaAction({
      action: 'campaign-bridge-to-xrpl',
      data: {
        component: 'campaign-bridge-to-xrpl-popup',
        inputValue,
        xrpBalance,
        estimatedFee,
      },
    });
    await bridge?.();
  };

  const buttonText = useMemo(() => {
    if (!isIdle) {
      if (isSuccess) return t('Return to voyage page');
      return t('Try again');
    }

    return t('Bridge');
  }, [isSuccess, isIdle, t]);

  const handleLink = () => {
    // Even if we don't use Fpass, we use substrate call so use extrinsicId.
    const txHash = txData?.extrinsicId;
    const url = `${SCANNER_URL[currentNetwork || NETWORK.THE_ROOT_NETWORK]}/extrinsic/${txHash}`;

    gaAction({
      action: 'go-to-transaction',
      data: { component: 'campaign-bridge-to-xrpl-popup', txHash: txHash, link: url },
    });

    window.open(url);
  };

  useEffect(() => {
    return () => {
      setBridgeGasError(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!estimateFee || !bridgeEnabled) return;

    const estimateBridgeFeeAsync = async () => {
      const fee = await estimateFee?.();
      setEstimatedBridgeFee(fee ?? 0.5);
    };
    estimateBridgeFeeAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bridgeEnabled]);

  return (
    <Popup
      id={POPUP_ID.CAMPAIGN_BRIDGE_TO_XRPL}
      title={isIdle ? t('Bridge to XRPL') : ''}
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
    >
      <Wrapper style={{ gap: isIdle ? 24 : 40 }} ref={ref}>
        {!isIdle && isSuccess && (
          <ResultWrapper>
            <ResultInnerWrapper>
              <SuccessIconWrapper>
                <IconCheck width={40} height={40} fill={COLOR.NEUTRAL[10]} />
              </SuccessIconWrapper>
              <ResultTitle>{t('Bridge confirmed!')}</ResultTitle>
              <ResultSubTitle>{t('bridge-to-xrpl-success-message')}</ResultSubTitle>
            </ResultInnerWrapper>
            <SuccessBottomWrapper>
              <List title={t('total-bridge')}>
                <TokenList
                  title={`${formatNumber(inputValue)} XRP`}
                  description={`$${formatNumber(bridgeTokenValue, 4)}`}
                  image={<IconTokenXrp width={36} />}
                  type="large"
                  leftAlign
                />
              </List>
              <TimeWrapper>
                <IconTime />
                {format(new Date(txDate), DATE_FORMATTER.FULL)}
                <ClickableIcon onClick={handleLink}>
                  <IconLink />
                </ClickableIcon>
              </TimeWrapper>
            </SuccessBottomWrapper>
          </ResultWrapper>
        )}
        {!isIdle && !isSuccess && (
          <ResultWrapper>
            <ResultInnerWrapper>
              <FailedIconWrapper>
                <IconCancel width={40} height={40} fill={COLOR.NEUTRAL[10]} />
              </FailedIconWrapper>
              <ResultTitle>{t('Bridge failed!')}</ResultTitle>
              <ResultSubTitle>{t('bridge-to-xrpl-fail-message')}</ResultSubTitle>
            </ResultInnerWrapper>
          </ResultWrapper>
        )}
        {isIdle && (
          <InnerWrapper>
            <List title="From" network={NETWORK.THE_ROOT_NETWORK}>
              <AccountWrapper>
                <RegularText>{t('Account')}</RegularText>
                <Account data-tooltip-id={TOOLTIP_ID.ADDRESS}>{truncatedAddress}</Account>
              </AccountWrapper>
              <Divider />
              <InputNumberWrapper>
                <InputNumber
                  name={'input1'}
                  control={control}
                  token={<Token token={xrp?.symbol || ''} image imageUrl={TokenXrp} />}
                  tokenName={xrp?.symbol || ''}
                  tokenValue={bridgeTokenValue}
                  balance={xrpBalance || 0}
                  balanceRaw={parseUnits(xrpBalance.toString(), 6) || 0n}
                  value={inputValue}
                  handleChange={val => {
                    setInputValue(val);
                  }}
                  handleChangeRaw={val => {
                    setInputValue(Number(formatUnits(val || 0n, 6)));
                  }}
                  maxButton
                  setValue={setValue}
                  formState={formState}
                />
              </InputNumberWrapper>
            </List>
            <ArrowIconWrapper>
              <ArrowDownWrapper>
                <IconArrowDown width={20} height={20} fill={COLOR.PRIMARY[50]} />
              </ArrowDownWrapper>
            </ArrowIconWrapper>
            <List title="To" network={NETWORK.XRPL}>
              <AccountWrapper>
                <RegularText>{t('Account')}</RegularText>
                <Account>{`${xrpWallet.address}`}</Account>
              </AccountWrapper>
            </List>
          </InnerWrapper>
        )}
        {isIdle && (
          <>
            <List title={t(`Summary`)}>
              <Summary>
                <SummaryTextTitle>{t('Total')}</SummaryTextTitle>
                <SummaryText>{`${formatNumber(inputValue)} XRP`}</SummaryText>
              </Summary>
              <Divider />
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
            </List>
          </>
        )}
      </Wrapper>
      <TooltipAddress address={address} />
    </Popup>
  );
};

const _BridgeToXrplPopupSkeleton = () => {
  const { t } = useTranslation();
  return (
    <Popup id={POPUP_ID.CAMPAIGN_BRIDGE_TO_XRPL} title={t('Bridge to XRPL')}>
      {/* // TODO */}
      <Wrapper>
        <ListSkeleton height={114} title={t("You're providing")} />
        <ListSkeleton height={183} title={t("You're expected to receive")} />
        <ListSkeleton height={122} title={t('Summary')} />
        <SkeletonBase height={48} borderRadius={12} />
      </Wrapper>
    </Popup>
  );
};

const Divider = tw.div`
  w-full h-1 flex-shrink-0 bg-neutral-20
`;

const Wrapper = tw.div`
  flex flex-col gap-24 px-24 py-0
`;

const InnerWrapper = tw.div`
  relative w-full flex flex-col bg-neutral-10 rounded-12 gap-16
`;
const ArrowIconWrapper = tw.div`
  absolute absolute-center-x bottom-92 z-1
`;
const ButtonWrapper = tw.div`
  mt-16 w-full
`;
const InputNumberWrapper = tw.div`
  m-2
`;
const ArrowDownWrapper = tw.div`
  p-6 flex-center rounded-full bg-neutral-30
`;
const AccountWrapper = tw.div`
  w-full flex items-center justify-between p-16
`;
const RegularText = tw.div`
  font-r-14 text-neutral-80
`;
const Account = tw.div`
 font-m-14 text-neutral-100 address
`;
const Summary = tw.div`
  flex justify-between bg-neutral-15 gap-16 px-16 py-8
`;
const SummaryTextTitle = tw.div`
  text-neutral-100 font-r-16
`;

const SummaryText = tw.div`
  text-neutral-100 font-m-16
`;
const GasFeeWrapper = tw.div`
  px-16 py-8 flex-col
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
const ResultTitle = tw.div`
  text-neutral-100 font-b-24
`;

const ResultSubTitle = tw.div`
  text-neutral-80 font-r-16
`;

const ResultWrapper = tw.div`
  flex-center flex-col gap-40
`;
const ResultInnerWrapper = tw.div`
  flex-center flex-col w-full gap-12
`;
const SuccessIconWrapper = tw.div`
  flex-center w-48 h-48 rounded-full bg-green-50
`;
const FailedIconWrapper = tw.div`
  flex-center w-48 h-48 rounded-full bg-red-50
`;
const SuccessBottomWrapper = tw.div`
  flex flex-col gap-16 w-full
`;
const TimeWrapper = styled.div(() => [
  tw`flex items-center gap-4 text-neutral-60`,
  css`
    & svg {
      width: 20px;
      height: 20px;
      fill: ${COLOR.NEUTRAL[60]};
    }
  `,
]);

const ClickableIcon = styled.div(() => [
  tw` clickable flex-center`,
  css`
    &:hover svg {
      fill: ${COLOR.NEUTRAL[80]};
    }
  `,
]);
