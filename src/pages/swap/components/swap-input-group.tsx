import { Suspense, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { last } from 'lodash-es';
import { strip } from 'number-precision';
import tw, { css, styled } from 'twin.macro';
import { Address, formatUnits, parseEther, parseUnits } from 'viem';
import { usePrepareContractWrite } from 'wagmi';
import * as yup from 'yup';

import { useBatchSwapPrepare as useBatchSwapPrepareEvm } from '~/api/api-contract/_evm/swap/substrate-batch-swap';
import { useSwapPrepare } from '~/api/api-contract/_evm/swap/substrate-swap';
import { useUserAllTokenBalances } from '~/api/api-contract/balance/user-all-token-balances';
import { useSorQuery } from '~/api/api-server/sor/batch-swap';
import { useSorFallbackQuery } from '~/api/api-server/sor/get-swap-fallback';

import { COLOR } from '~/assets/colors';
import { IconArrowDown, IconDown } from '~/assets/icons';

import { EVM_VAULT_ADDRESS, THOUSAND } from '~/constants';

import { AlertMessage } from '~/components/alerts';
import { ButtonPrimaryLarge } from '~/components/buttons';
import { InputNumber } from '~/components/inputs';
import { SkeletonBase } from '~/components/skeleton/skeleton-base';
import { Token } from '~/components/token';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import {
  _calcOutGivenIn,
  formatNumber,
  getNetworkAbbr,
  getNetworkFull,
  getTokenDecimal,
  handleEvmTokenAddress,
} from '~/utils';
import { useSlippageStore } from '~/states/data';
import { NETWORK, SwapKind, SwapSingleSwapInput } from '~/types';
import { POPUP_ID } from '~/types/components';

import { BALANCER_VAULT_ABI } from '~/abi';

import { useSwapStore } from '../states';

import { SelectFromTokenPopup } from './select-token-from-popup';
import { SelectToTokenPopup } from './select-token-to-popup';
import { SwapPopup } from './swap-popup';

interface InputFormState {
  from: number;
  to: number;
}

export const SwapInputGroup = () => {
  return (
    <Suspense fallback={<_SwapInputGroupSkeleton />}>
      <_SwapInputGroup />
    </Suspense>
  );
};
const _SwapInputGroup = () => {
  const { gaAction } = useGAAction();

  const [arrowHover, setArrowHover] = useState(false);

  const { network } = useParams();
  const { selectedNetwork, isEvm, isFpass, isXrp } = useNetwork();
  const { t } = useTranslation();

  const { slippage: slippageRaw } = useSlippageStore();
  const slippage = Number(slippageRaw || 0);

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);

  const isRoot = currentNetwork === NETWORK.THE_ROOT_NETWORK;
  const isXrpEvm = currentNetwork === NETWORK.EVM_SIDECHAIN;

  const { opened: selectTokenFromPopupOpened, open: openSelectTokenFromPopup } = usePopup(
    POPUP_ID.SWAP_SELECT_TOKEN_FROM
  );
  const { opened: selectTokenToPopupOpened, open: openSelectTokenToPopup } = usePopup(
    POPUP_ID.SWAP_SELECT_TOKEN_TO
  );
  const { opened: swapPopupOpened, open: openSwapPopup } = usePopup(POPUP_ID.SWAP);

  const { evm, xrp, fpass } = useConnectedWallet();
  const walletAddress = isFpass ? fpass?.address : isEvm ? evm?.address : xrp?.address;

  const {
    fromToken,
    toToken,

    fromInput,

    setFromToken,
    setToToken,

    setFromInput,
    resetAll,
  } = useSwapStore();

  // TODO
  const isStable =
    (fromToken?.symbol === 'USDC' && toToken?.symbol === 'USDT') ||
    (fromToken?.symbol === 'USDT' && toToken?.symbol === 'USDC');

  const { userAllTokenBalances: userAllTokenBalancesWithLpToken, refetch: refetchBalance } =
    useUserAllTokenBalances();
  const userAllTokenBalances = useMemo(
    () => userAllTokenBalancesWithLpToken?.filter(t => !t.isLpToken),
    [userAllTokenBalancesWithLpToken]
  );

  const rightNetwork =
    !!fromToken &&
    !!toToken &&
    fromToken?.network === currentNetwork &&
    toToken?.network === currentNetwork;

  const {
    data: swapOptimizedPathPoolData,
    isFetching: isSorFallbackLoading,
    isError: isSorFallbackError,
  } = useSorFallbackQuery(
    {
      queries: {
        networkAbbr: currentNetworkAbbr,
        fromTokenId: fromToken?.id || 0,
        toTokenId: toToken?.id || 0,
      },
    },
    {
      enabled: rightNetwork && !!currentNetworkAbbr,
      staleTime: 1000 * 3,
    }
  );
  const { pool: swapOptimizedPathPool } = swapOptimizedPathPoolData || {};

  const { data: swapInfoData } = useSorQuery(
    {
      queries: {
        network: currentNetwork,
        from: fromToken?.address || '',
        to: toToken?.address || '',
        amount: parseUnits(
          (Number(fromInput) || 0).toFixed(18),
          getTokenDecimal(currentNetwork, fromToken?.symbol)
        ).toString(),
      },
    },
    {
      enabled: (isRoot || isXrpEvm) && !!fromToken && !!toToken && isSorFallbackError,
      staleTime: 1000 * 3,
    }
  );
  const swapsRaw = swapInfoData?.data.swaps ?? [];
  const swaps = swapsRaw.map(({ poolId, assetInIndex, assetOutIndex, amount, userData }) => [
    poolId,
    assetInIndex,
    assetOutIndex,
    amount,
    userData,
  ]);
  const assets = swapInfoData?.data.tokenAddresses ?? [];

  const { data } = usePrepareContractWrite({
    address: EVM_VAULT_ADDRESS[currentNetwork] as Address,
    abi: BALANCER_VAULT_ABI,
    functionName: 'queryBatchSwap',
    args: [SwapKind.GivenIn, swaps, assets, [walletAddress, false, walletAddress, false]],
    enabled: !!walletAddress && !!swaps?.length && !!assets?.length && !!swapInfoData,
    staleTime: 1000 * 10,
  });

  const toInputFromSor = -Number(
    formatUnits(
      last((data?.result || []) as bigint[]) || 0n,
      getTokenDecimal(currentNetwork, toToken?.symbol)
    )
  );

  /* swap optimized path pool의 해당 토큰 balance와 price */
  const { balance: fromTokenReserveRaw, price: fromTokenPriceRaw } =
    swapOptimizedPathPool?.compositions?.find(c => c.symbol === fromToken?.symbol) || {
      balance: 0,
      price: 0,
    };
  const fromTokenReserve = fromTokenReserveRaw || 0;
  const fromTokenPrice = fromToken?.price || fromTokenPriceRaw || 0;

  /* swap 하고자 하는 토큰 유저 balance */
  const fromTokenBalance = Number(
    userAllTokenBalances?.find(t => t.symbol === fromToken?.symbol)?.balance || 0
  );

  /* swap optimized path pool의 해당 토큰 balance와 price */
  const { balance: toTokenReserveRaw, price: toTokenPriceRaw } =
    swapOptimizedPathPool?.compositions?.find(c => c.symbol === toToken?.symbol) || {
      balance: 0,
      price: 0,
    };
  const toTokenReserve = toTokenReserveRaw || 0;
  const toTokenPrice = toToken?.price || toTokenPriceRaw || 0;

  /* swap 하고자 하는 토큰 유저 balance */
  const toTokenBalance = Number(
    userAllTokenBalances?.find(t => t.symbol === toToken?.symbol)?.balance || 0
  );

  const schema = yup.object().shape({
    from: yup.number().min(0).max(fromTokenBalance, t('Exceeds wallet balance')).required(),
    to: yup.number().min(0).required(),
  });

  const { control, setValue, formState } = useForm<InputFormState>({
    resolver: yupResolver(schema),
  });
  const fee = swapOptimizedPathPool?.tradingFee || 0;

  const toInputFromSinglePoolNormal =
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

  const stableDeciaml = 6; // TODO: hardcoded for USDT-USDC pool
  const toInputFromSinglePoolStable =
    fromToken && toToken
      ? fromInput
        ? Number(
            formatUnits(
              _calcOutGivenIn(
                parseEther('1000'), // TODO: hardcoded for USDT-USDC pool
                [
                  parseUnits(fromTokenReserve.toFixed(6), stableDeciaml),
                  parseUnits(toTokenReserve.toFixed(6), stableDeciaml),
                ],
                0,
                1,
                parseUnits(Number(fromInput).toFixed(6), stableDeciaml),
                parseEther(fee.toFixed(18))
              ),
              stableDeciaml
            )
          )
        : undefined
      : undefined;

  const toInputFromSinglePool = isStable
    ? toInputFromSinglePoolStable
    : toInputFromSinglePoolNormal;

  const toInput = toInputFromSor || toInputFromSinglePool || 0;
  const swapRatio =
    fromInput && toInput
      ? (toInput || 0) / (Number(fromInput || 0) === 0 ? 0.0001 : Number(fromInput || 0))
      : toTokenReserve - toTokenReserve * (fromTokenReserve / (fromTokenReserve + (1 - fee)));

  const validToSwap =
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

  const { isPrepareLoading, isPrepareError, prepareError } = useBatchSwapPrepareEvm({
    fromToken: (fromToken?.address || '0x0') as Address,
    toToken: (toToken?.address || '0x0') as Address,
    swapAmount: parseUnits(
      `${(Number(fromInput) || 0).toFixed(18)}`,
      getTokenDecimal(currentNetwork, fromToken?.symbol)
    ),
    fundManagement: [walletAddress, false, walletAddress, false],
    limit: [
      parseUnits(
        `${(Number(fromInput) || 0).toFixed(18)}`,
        getTokenDecimal(currentNetwork, fromToken?.symbol)
      ),
      -parseUnits(
        `${((toInput || 0) * (1 - slippage / 100)).toFixed(18)}`,
        getTokenDecimal(currentNetwork, toToken?.symbol)
      ),
    ],
    proxyEnabled: !!swapInfoData && !!validToSwap && !swapOptimizedPathPool,
  });

  const singleSwap = [
    swapOptimizedPathPool?.poolId || '',
    SwapKind.GivenIn,
    handleEvmTokenAddress(fromToken, currentNetwork)?.address || '',
    handleEvmTokenAddress(toToken, currentNetwork)?.address || '',
    parseUnits(
      `${Number(fromInput || 0).toFixed(18)}`,
      getTokenDecimal(currentNetwork, fromToken?.symbol)
    ),
    '0x0',
  ] as SwapSingleSwapInput;
  const {
    isPrepareLoading: isSingleSwapPrepareLoading,
    isPrepareError: isSingleSwapPrepareError,
    prepareError: singleSwapPrepareError,
  } = useSwapPrepare({
    poolId: swapOptimizedPathPool?.poolId || '',
    singleSwap,
    fundManagement: [walletAddress, false, walletAddress, false],
    enabled: !!validToSwap && !!swapOptimizedPathPool,
  });

  const errorMessage = prepareError?.message || singleSwapPrepareError?.message || '';
  const poolImpactError = errorMessage?.includes('304') || errorMessage?.includes('305');

  const sorError =
    (isRoot || isXrpEvm) &&
    fromToken &&
    toToken &&
    toInputFromSor === 0 &&
    fromInput &&
    !!swapInfoData;

  const sorFallbackError = isSorFallbackError && isXrp && fromToken && toToken;

  const errorTitle = t(
    isRoot || isXrpEvm
      ? poolImpactError || sorError
        ? 'Price impact over 30%'
        : 'Something went wrong'
      : sorFallbackError
      ? 'Cannot swap'
      : 'Something went wrong'
  );
  const errorDescription = t(
    isRoot || isXrpEvm
      ? poolImpactError || sorError
        ? 'price-impact-error-message'
        : 'unknown-error-message'
      : sorFallbackError
      ? 'cannot-swap-error-message'
      : 'unknown-error-message'
  );

  useEffect(() => {
    resetAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNetwork]);

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
              THOUSAND,
              0
            )} ${toToken.symbol}`}</InputLabel>
          )}
        </InputWrapper>

        {(isPrepareError || isSingleSwapPrepareError || sorError || sorFallbackError) && (
          <AlertMessage title={errorTitle} description={errorDescription} type="warning" />
        )}

        <ButtonPrimaryLarge
          text={t('Preview')}
          isLoading={isPrepareLoading || isSingleSwapPrepareLoading || isSorFallbackLoading}
          disabled={!validToSwap || isPrepareError || isSingleSwapPrepareError}
          onClick={() => openSwapPopup()}
        />
      </Wrapper>

      {walletAddress && selectTokenFromPopupOpened && (
        <SelectFromTokenPopup
          userAllTokenBalances={userAllTokenBalances}
          tokenPrice={fromTokenPrice}
        />
      )}
      {walletAddress && selectTokenToPopupOpened && (
        <SelectToTokenPopup userAllTokenBalances={userAllTokenBalances} tokenPrice={toTokenPrice} />
      )}

      {walletAddress && swapPopupOpened && !isPrepareError && !isSingleSwapPrepareError && (
        <SwapPopup swapOptimizedPathPool={swapOptimizedPathPool} refetchBalance={refetchBalance} />
      )}
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
