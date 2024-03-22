import { Suspense, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import { strip } from 'number-precision';
import tw, { css, styled } from 'twin.macro';
import * as yup from 'yup';

import { useAmmInfo } from '~/api/api-contract/_xrpl/amm/amm-info';
import { useUserAllTokenBalances } from '~/api/api-contract/balance/user-all-token-balances';

import { COLOR } from '~/assets/colors';
import { IconArrowDown, IconDown } from '~/assets/icons';

import { MILLION } from '~/constants';

import { AlertMessage } from '~/components/alerts';
import { ButtonPrimaryLarge } from '~/components/buttons';
import { InputNumber } from '~/components/inputs';
import { SkeletonBase } from '~/components/skeleton/skeleton-base';
import { Token } from '~/components/token';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { usePopup } from '~/hooks/components';
import { useConnectedWallet } from '~/hooks/wallets';
import { formatAmountToNumberFromToken, formatNumber, tokenToAmmAsset } from '~/utils';
import { POPUP_ID } from '~/types/components';

import { useSwapStore } from '../states';

import { SelectTokenPopupXrpl } from './select-token-popup-xrpl';
import { SwapPopupXrpl } from './swap-popup-xrpl';

interface InputFormState {
  from: number;
  to: number;
}

export const SwapInputGroupXrpl = () => {
  return (
    <Suspense fallback={<_SwapInputGroupSkeleton />}>
      <_SwapInputGroup />
    </Suspense>
  );
};
const _SwapInputGroup = () => {
  const { gaAction } = useGAAction();

  const [arrowHover, setArrowHover] = useState(false);

  const { t } = useTranslation();

  const { xrp } = useConnectedWallet();
  const walletAddress = useMemo(() => xrp?.address || '', [xrp]);

  const {
    fromToken,
    toToken,

    fromInput,

    setFromToken,
    setToToken,

    setFromInput,
  } = useSwapStore();

  const { data: ammInfoData, isError } = useAmmInfo({
    asset: tokenToAmmAsset(fromToken),
    asset2: tokenToAmmAsset(toToken),
    enabled: !!fromToken && !!toToken,
  });
  const { amm } = ammInfoData || {};
  const { trading_fee: trandingFee } = amm || {};

  const fromTokenReserve = formatAmountToNumberFromToken(fromToken, amm);
  const toTokenReserve = formatAmountToNumberFromToken(toToken, amm);
  const fee = (trandingFee || 0) / 10 ** 6;

  const toInput =
    fromToken && toToken
      ? fromInput
        ? Number(
            strip(
              toTokenReserve -
                toTokenReserve *
                  (fromTokenReserve / (fromTokenReserve + Number(fromInput) * (1 - fee)))
            ).toFixed(6)
          )
        : undefined
      : undefined;

  const swapRatio =
    fromInput && toInput
      ? (toInput || 0) / (Number(fromInput || 0) === 0 ? 0.0001 : Number(fromInput || 0))
      : toTokenReserve - toTokenReserve * (fromTokenReserve / (fromTokenReserve + (1 - fee)));

  const {
    userAllTokenBalances: userAllTokenBalancesWithLpToken,
    hasNextPage,
    fetchNextPage,
  } = useUserAllTokenBalances();
  const userAllTokenBalances = useMemo(
    () => userAllTokenBalancesWithLpToken?.filter(t => !t.isLpToken),
    [userAllTokenBalancesWithLpToken]
  );

  const fromTokenData = userAllTokenBalances?.find(t => t.symbol === fromToken?.symbol);
  const fromTokenBalance = Number(fromTokenData?.balance || 0);
  const fromTokenPrice = Number(fromTokenData?.price || 0);

  const toTokenData = userAllTokenBalances?.find(t => t.symbol === toToken?.symbol);
  const toTokenBalance = Number(toTokenData?.balance || 0);
  const toTokenPrice = Number(toTokenData?.price || 0);

  const schema = yup.object().shape({
    from: yup.number().min(0).max(fromTokenBalance, t('Exceeds wallet balance')).required(),
    to: yup.number().min(0).required(),
  });

  const { control, setValue, formState } = useForm<InputFormState>({
    resolver: yupResolver(schema),
  });

  const { opened: selectTokenFromPopupOpened, open: openSelectTokenFromPopup } = usePopup(
    POPUP_ID.SWAP_SELECT_TOKEN_FROM
  );
  const { opened: selectTokenToPopupOpened, open: openSelectTokenToPopup } = usePopup(
    POPUP_ID.SWAP_SELECT_TOKEN_TO
  );
  const { opened: swapPopupOpened, open: openSwapPopup } = usePopup(POPUP_ID.SWAP);

  const validToSwap =
    !isError &&
    !!walletAddress &&
    fromInput &&
    Number(fromInput) > 0 &&
    Number(fromInput) <= fromTokenBalance &&
    toInput &&
    toInput > 0;

  const arrowClick = () => {
    gaAction({
      action: 'switch-from-to',
      data: { page: 'swap' },
    });

    setFromToken(toToken);
    setToToken(fromToken);
  };

  return (
    <>
      <Wrapper>
        <InputWrapper>
          <InputInnerWrapper>
            <InputNumber
              token={
                <Token
                  token={fromToken?.symbol || ''}
                  title={fromToken ? '' : t('Select token')}
                  icon={<IconDown />}
                  image
                  imageUrl={fromToken?.image}
                />
              }
              balance={fromTokenBalance}
              tokenValue={fromTokenPrice * (Number(fromInput) || 0)}
              value={fromInput}
              maxButton
              slider
              handleChange={setFromInput}
              handleTokenClick={openSelectTokenFromPopup}
              name={'from'}
              control={control}
              setValue={setValue}
              formState={formState}
            />
            <IconWrapper
              onClick={() => arrowClick()}
              onMouseEnter={() => setArrowHover(true)}
              onMouseLeave={() => setArrowHover(false)}
            >
              <ArrowDownWrapper hover={arrowHover}>
                <IconArrowDown width={20} height={20} fill={COLOR.PRIMARY[50]} />
              </ArrowDownWrapper>
            </IconWrapper>
            <InputNumber
              disabled
              token={
                <Token
                  token={toToken?.symbol || ''}
                  title={toToken ? '' : t('Select token')}
                  icon={<IconDown />}
                  image
                  imageUrl={toToken?.image}
                />
              }
              balance={toTokenBalance}
              tokenValue={toTokenPrice * (Number(toInput) || 0)}
              value={toInput}
              focus={false}
              handleTokenClick={openSelectTokenToPopup}
              name={'to'}
              control={control}
              setValue={setValue}
              formState={formState}
            />
          </InputInnerWrapper>
          {fromToken && toToken && (
            <InputLabel>{`1 ${fromToken.symbol} = ${formatNumber(
              swapRatio,
              6,
              'floor',
              MILLION,
              0
            )} ${toToken.symbol}`}</InputLabel>
          )}
        </InputWrapper>

        {isError && (
          <AlertMessage
            title={t('Cannot swap')}
            description={t('cannot-swap-error-message')}
            type="warning"
          />
        )}

        <ButtonPrimaryLarge
          text={t('Preview')}
          disabled={!validToSwap}
          onClick={() => openSwapPopup()}
        />
      </Wrapper>

      {selectTokenFromPopupOpened && (
        <SelectTokenPopupXrpl
          type="from"
          userAllTokenBalances={userAllTokenBalances}
          tokenPrice={fromTokenPrice}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
        />
      )}
      {selectTokenToPopupOpened && (
        <SelectTokenPopupXrpl
          type="to"
          userAllTokenBalances={userAllTokenBalances}
          tokenPrice={toTokenPrice}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
        />
      )}

      {walletAddress && swapPopupOpened && <SwapPopupXrpl />}
    </>
  );
};

const _SwapInputGroupSkeleton = () => {
  return (
    <Wrapper>
      <InputInnerWrapper>
        <SkeletonBase height={108} />
        <IconWrapper>
          <ArrowDownWrapper>
            <IconArrowDown width={20} height={20} fill={COLOR.PRIMARY[50]} />
          </ArrowDownWrapper>
        </IconWrapper>
        <SkeletonBase height={108} />
      </InputInnerWrapper>
      <SkeletonBase height={40} borderRadius={12} style={{ marginTop: 36 }} />
    </Wrapper>
  );
};

const Wrapper = tw.div`
   w-full flex flex-col flex-shrink-0 rounded-12 bg-neutral-10 gap-20 p-20
   md:(w-455 p-24 gap-24)
`;

const InputWrapper = tw.div`
  flex flex-col gap-16
`;

const InputInnerWrapper = tw.div`
  flex flex-col gap-16 relative
`;

const IconWrapper = tw.div`
  absolute absolute-center-x bottom-100 z-2 clickable select-none
`;

interface ArrowDownWrapperProps {
  hover?: boolean;
}
const ArrowDownWrapper = styled.div<ArrowDownWrapperProps>(({ hover }) => [
  tw`
    p-6 flex-center rounded-full bg-neutral-20 transition-transform
  `,
  hover &&
    css`
      transform: rotate(180deg);
    `,
]);

const InputLabel = tw.div`
  flex justify-end font-r-12 text-neutral-60
`;
