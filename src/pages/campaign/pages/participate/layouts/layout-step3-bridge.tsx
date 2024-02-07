import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import { format } from 'date-fns';
import tw, { css, styled } from 'twin.macro';
import { formatUnits } from 'viem';
import * as yup from 'yup';

import { useUserAllTokenBalances } from '~/api/api-contract/_xrpl/balance/user-all-token-balances';
import { useBridgeXrplToRoot } from '~/api/api-contract/_xrpl/bridge/bridge-xrpl-to-root';

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

import { SCANNER_URL, THOUSAND } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { InputNumber } from '~/components/inputs';
import { List } from '~/components/lists';
import { ButtonSkeleton } from '~/components/skeleton/button-skeleton';
import { ListSkeleton } from '~/components/skeleton/list-skeleton';
import { Token } from '~/components/token';
import { TokenList } from '~/components/token-list';

import { TooltipAddress } from '~/pages/campaign/components/tooltip-address';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { useConnectedWallet } from '~/hooks/wallets';
import { DATE_FORMATTER, formatNumber, getTokenDecimal } from '~/utils';
import { useTheRootNetworkSwitchWalletStore } from '~/states/contexts/wallets/switch-wallet';
import { NETWORK, TOOLTIP_ID } from '~/types';

import { useStep } from '../hooks/use-step';

interface InputFormState {
  input: number;
}

export const LayoutStep3Bridge = () => (
  <Suspense fallback={<_BridgeSkeleton />}>
    <_Bridge />
  </Suspense>
);

const _Bridge = () => {
  const { ref } = useGAInView({ name: 'campaign-step-3' });
  const { gaAction } = useGAAction();

  const [inputValue, setInputValue] = useState<number>();

  const { selectedWallet } = useTheRootNetworkSwitchWalletStore();
  const { evm, fpass } = useConnectedWallet();
  const { userAllTokenBalances } = useUserAllTokenBalances();

  const { goNext, setStepStatus } = useStep();

  const { t } = useTranslation();

  const address = selectedWallet === 'fpass' ? fpass.address : evm.address;
  const truncatedAddress =
    selectedWallet === 'fpass' ? fpass.truncatedAddress : evm.truncatedAddress;

  const xrp = userAllTokenBalances?.find(t => t.symbol === 'XRP');
  const xrpBalance = xrp?.balance || 0;
  const xrpPrice = xrp?.price || 0;
  const tokenValue = inputValue ? inputValue * xrpPrice : 0;

  const bridgeFee = 0; // TODO: check bridge fee

  const xrplFee = 0.000015; // TODO: get actual fee
  const xrpAfterFee = Number(inputValue || 0) * (1 - bridgeFee);
  const validToBridge =
    !!inputValue && Number(inputValue || 0) > 0 && Number(inputValue || 0) + xrplFee <= xrpBalance;

  // TODO: number decimal
  const {
    isLoading,
    isSuccess: bridgeSuccess,
    isError,
    txData,
    blockTimestamp,
    reset,
    bridge,
  } = useBridgeXrplToRoot({
    fromInput: Number(inputValue || 0),
    toAddress: address,
    enabled: !!validToBridge && !!address,
  });

  const txDate = new Date(blockTimestamp || 0);
  const isIdle = !txData || !(isError || bridgeSuccess);
  const isSuccess = bridgeSuccess && !!txData;

  const toTokenActualAmount = Number(
    formatUnits(txData?.bridgeAmountTo ?? 0n, getTokenDecimal(NETWORK.XRPL, 'XRP'))
  );

  const toTokenFinalValue = toTokenActualAmount * (xrp?.price || 0);

  const schema = yup.object().shape({
    input: yup.number().min(0).max(xrpBalance, t('Exceeds wallet balance')).required(),
  });
  const { control, setValue, formState } = useForm<InputFormState>({
    resolver: yupResolver(schema),
  });

  const handleButtonClick = async () => {
    gaAction({
      action: 'campaign-participate-step-3',
      data: {
        component: 'campaign-participate',
        inputValue,
        toAddress: address,
        xrpBalance,
      },
    });
    await bridge();
  };

  const handleLink = () => {
    const txHash = txData?.hash;
    const url = `${SCANNER_URL[NETWORK.XRPL]}/transactions/${txHash}`;

    gaAction({
      action: 'go-to-transaction',
      data: { component: 'campaign-step-3', txHash: txHash, link: url },
    });

    window.open(url);
  };

  return (
    <>
      {!isIdle && isSuccess && (
        <SuccessWrapper>
          <SuccessMessageWrapper>
            <SuccessIconWrapper>
              <IconCheck width={40} height={40} />
            </SuccessIconWrapper>
            <SuccessTitle>{t('Bridge confirmed!')}</SuccessTitle>
            <SuccessSubTitle>{t('bridge-success-message')}</SuccessSubTitle>
          </SuccessMessageWrapper>
          <List title={t('total-bridge')}>
            <TokenList
              title={`${formatNumber(toTokenActualAmount, 6, 'floor', THOUSAND, 0)} XRP`}
              description={`$${formatNumber(toTokenFinalValue)}`}
              image={<IconTokenXrp width={36} />}
              type="large"
              leftAlign
            />
          </List>
          <SuccessBottomWrapper>
            <TimeWrapper>
              <IconTime />
              {format(new Date(txDate), DATE_FORMATTER.FULL)}
              <ClickableIcon onClick={handleLink}>
                <IconLink />
              </ClickableIcon>
            </TimeWrapper>
            <ButtonPrimaryLarge
              text={t('Continue to add liquidity')}
              onClick={() => goNext(() => setStepStatus({ id: 3, status: 'done' }, 2))}
            />
          </SuccessBottomWrapper>
        </SuccessWrapper>
      )}
      {!isIdle && isError && (
        <FailedWrapper>
          <FailedInnerWrapper>
            <FailedIconWrapper>
              <IconCancel width={40} height={40} />
            </FailedIconWrapper>
            <SuccessTitle>{t('Bridge failed')}</SuccessTitle>
            <SuccessSubTitle>{t('bridge-fail-message')}</SuccessSubTitle>
          </FailedInnerWrapper>
          <ButtonPrimaryLarge text={t('Try again')} buttonType="outlined" onClick={() => reset()} />
        </FailedWrapper>
      )}
      {isIdle && (
        <>
          <Wrapper ref={ref}>
            <InputNumber
              name={'input'}
              title="From"
              network={NETWORK.XRPL}
              control={control}
              token={<Token token={'XRP'} image imageUrl={TokenXrp} />}
              tokenName={'XRPL'}
              tokenValue={Number(formatNumber(tokenValue))}
              balance={xrpBalance}
              value={inputValue}
              handleChange={val => setInputValue(val)}
              maxButton
              setValue={setValue}
              formState={formState}
            />
            <IconWrapper>
              <ArrowDownWrapper>
                <IconArrowDown width={20} height={20} fill={COLOR.PRIMARY[50]} />
              </ArrowDownWrapper>
            </IconWrapper>
            <List title="To" network={NETWORK.THE_ROOT_NETWORK}>
              <AccountWrapper>
                <RegularText>{t('Account')}</RegularText>
                <Account data-tooltip-id={TOOLTIP_ID.ADDRESS}>{truncatedAddress}</Account>
              </AccountWrapper>
            </List>
            <TotalXrpWrapper>
              <TextWrapper>
                <TotalExpectedXrp>{t('Total expected after fee')}</TotalExpectedXrp>
                <Amount>{`${formatNumber(xrpAfterFee)} XRP`}</Amount>
              </TextWrapper>
              <TextWrapper>
                <RegularText>{t('Fee')}</RegularText>
                <RegularText>{`~ ${xrplFee} XRP`}</RegularText>
              </TextWrapper>
            </TotalXrpWrapper>
            <ButtonPrimaryLarge
              text={t('Bridge')}
              disabled={!validToBridge}
              isLoading={isLoading}
              onClick={handleButtonClick}
            />
          </Wrapper>
          <TooltipAddress address={address} />
        </>
      )}
    </>
  );
};

const _BridgeSkeleton = () => {
  return (
    <Wrapper>
      <SkeletonListWrapper>
        <ListSkeleton title="From" network={NETWORK.XRPL} height={152} />
        <IconWrapper>
          <ArrowDownWrapper>
            <IconArrowDown width={20} height={20} fill={COLOR.PRIMARY[50]} />
          </ArrowDownWrapper>
        </IconWrapper>
        <ListSkeleton title="To" network={NETWORK.THE_ROOT_NETWORK} height={106} />
        <ListSkeleton height={94} />
      </SkeletonListWrapper>
      <ButtonSkeleton />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  relative w-full flex flex-col p-24 bg-neutral-10 rounded-12 gap-16
`;
const RegularText = tw.div`
  font-r-14 text-neutral-80
`;
const AccountWrapper = tw.div`
  w-full flex items-center justify-between p-16
`;
const Account = tw.div`
 font-m-14 text-neutral-100 address
`;
const TotalXrpWrapper = tw.div`
  w-full flex flex-col px-20 py-16 gap-12 bg-neutral-15 rounded-8
`;
const TextWrapper = tw.div`
  w-full flex items-center justify-between
`;
const TotalExpectedXrp = tw.div`
  font-r-16 text-neutral-100
`;
const Amount = tw.div`
  font-m-16 text-neutral-100
`;
const IconWrapper = tw.div`
  absolute absolute-center-x bottom-288 z-1
`;

const ArrowDownWrapper = tw.div`
  p-6 flex-center rounded-full bg-neutral-30
`;
const SuccessTitle = tw.div`
  text-neutral-100 font-b-20
  md:font-b-24
`;

const SuccessSubTitle = tw.div`
  text-center text-neutral-80 font-r-14
  md:font-r-16
`;

const SuccessWrapper = tw.div`
  flex flex-col bg-neutral-10 pt-40 p-24 gap-40 rounded-12
`;
const SuccessMessageWrapper = tw.div`
  flex-center flex-col gap-12 
`;
const SuccessBottomWrapper = tw.div`
  flex flex-col gap-16
`;
const SuccessIconWrapper = tw.div`
  flex-center w-48 h-48 rounded-full bg-green-50
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
const FailedWrapper = tw.div`
  w-full flex-center flex-col gap-40 pt-40 pb-24 px-24 bg-neutral-10 rounded-12
`;

const FailedInnerWrapper = tw.div`
  flex-center flex-col gap-12
`;

const FailedIconWrapper = tw.div`
  flex-center w-48 h-48 rounded-full bg-red-50
`;

const SkeletonListWrapper = tw.div`
  w-full flex flex-col gap-16
`;
