import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { strip } from 'number-precision';
import tw from 'twin.macro';
import * as yup from 'yup';

import { useUserAllTokenBalances } from '~/api/api-contract/balance/user-all-token-balances';
import { useGetSwapOptimizedPathQuery } from '~/api/api-server/pools/get-swap-optimized-path';

import { COLOR } from '~/assets/colors';
import { IconArrowDown, IconDown } from '~/assets/icons';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { InputNumber } from '~/components/inputs';
import { Token } from '~/components/token';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { formatFloat, formatNumber, getNetworkAbbr, getNetworkFull } from '~/utils';
import { useSwapStore } from '~/states/pages';
import { POPUP_ID } from '~/types/components';

import { SelectFromTokenPopup } from './select-token-from-popup';
import { SelectToTokenPopup } from './select-token-to-popup';
import { SwapPopup } from './swap-popup';

interface InputFormState {
  from: number;
  to: number;
}
export const SwapInputGroup = () => {
  const { network } = useParams();
  const { selectedNetwork, isEvm, isFpass } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);

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
  } = useSwapStore();

  const { userAllTokenBalances } = useUserAllTokenBalances();
  const { data: swapOptimizedPathPoolData } = useGetSwapOptimizedPathQuery(
    {
      params: {
        networkAbbr: currentNetworkAbbr,
      },
      queries: {
        fromTokenId: fromToken?.id || 0,
        toTokenId: toToken?.id || 0,
      },
    },
    {
      enabled: !!fromToken && !!toToken && !!currentNetworkAbbr,
      staleTime: 1000 * 3,
    }
  );
  const { pool: swapOptimizedPathPool } = swapOptimizedPathPoolData || {};

  /* swap optimized path pool의 해당 토큰 balance와 price */
  const { balance: fromTokenReserveRaw, price: fromTokenPriceRaw } =
    swapOptimizedPathPool?.compositions?.find(c => c.symbol === fromToken?.symbol) || {
      balance: 0,
      price: 0,
    };
  const fromTokenReserve = fromTokenReserveRaw || 0;
  const fromTokenPrice = fromTokenPriceRaw || 0;
  /* swap 하고자 하는 토큰 유저 balance */
  const fromTokenBalance =
    userAllTokenBalances?.find(t => t.symbol === fromToken?.symbol)?.balance || 0;

  /* swap optimized path pool의 해당 토큰 balance와 price */
  const { balance: toTokenReserveRaw, price: toTokenPriceRaw } =
    swapOptimizedPathPool?.compositions?.find(c => c.symbol === toToken?.symbol) || {
      balance: 0,
      price: 0,
    };
  const toTokenReserve = toTokenReserveRaw || 0;
  const toTokenPrice = toTokenPriceRaw || 0;
  /* swap 하고자 하는 토큰 유저 balance */
  const toTokenBalance =
    userAllTokenBalances?.find(t => t.symbol === toToken?.symbol)?.balance || 0;

  const schema = yup.object().shape({
    from: yup.number().min(0).max(fromTokenBalance, 'Exceeds wallet balance').required(),
    to: yup.number().min(0).required(),
  });
  const { control, setValue, formState } = useForm<InputFormState>({
    resolver: yupResolver(schema),
  });
  const fee = swapOptimizedPathPool?.trandingFees || 0;

  const toInput =
    fromToken && toToken
      ? fromInput
        ? Number(
            formatFloat(
              strip(
                toTokenReserve -
                  toTokenReserve *
                    (fromTokenReserve / (fromTokenReserve + Number(fromInput) * (1 - fee)))
              ),
              6
            )
          )
        : undefined
      : undefined;

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
                  title={fromToken ? '' : 'Select token'}
                  icon={<IconDown />}
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
            <IconWrapper onClick={() => arrowClick()}>
              <ArrowDownWrapper>
                <IconArrowDown width={20} height={20} fill={COLOR.PRIMARY[50]} />
              </ArrowDownWrapper>
            </IconWrapper>
            <InputNumber
              disabled
              token={
                <Token
                  token={toToken?.symbol || ''}
                  title={toToken ? '' : 'Select token'}
                  icon={<IconDown />}
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
            <InputLabel>{`1 ${fromToken} = ${formatNumber(swapRatio, 6)} ${toToken}`}</InputLabel>
          )}
        </InputWrapper>
        <ButtonPrimaryLarge text="Preview" disabled={!validToSwap} onClick={openSwapPopup} />
      </Wrapper>
      {walletAddress && selectTokenFromPopupOpened && (
        <SelectFromTokenPopup userAllTokenBalances={userAllTokenBalances} />
      )}
      {walletAddress && selectTokenToPopupOpened && (
        <SelectToTokenPopup userAllTokenBalances={userAllTokenBalances} />
      )}
      {walletAddress && swapPopupOpened && (
        <SwapPopup
          swapOptimizedPathPool={swapOptimizedPathPool}
          userAllTokenBalances={userAllTokenBalances}
        />
      )}
    </>
  );
};

const Wrapper = tw.div`
   w-452 flex flex-col flex-shrink-0 rounded-12 bg-neutral-10 px-24 py-20 gap-24
`;

const InputWrapper = tw.div`
  flex flex-col gap-16
`;

const InputInnerWrapper = tw.div`
  flex flex-col gap-16 relative
`;

const IconWrapper = tw.div`
  absolute absolute-center-x bottom-100 z-1 clickable select-none
`;

const ArrowDownWrapper = tw.div`
  p-6 flex-center rounded-full bg-neutral-20
`;

const InputLabel = tw.div`
  flex justify-end font-r-12 text-neutral-60
`;
