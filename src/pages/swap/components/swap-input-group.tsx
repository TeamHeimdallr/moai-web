import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import tw from 'twin.macro';
import * as yup from 'yup';

import { useTokenBalanceInPool } from '~/api/api-contract/balance/get-token-balance-in-pool';
import { useLiquidityPoolBalance } from '~/api/api-contract/pool/get-liquidity-pool-balance';
import { useTokenPrice } from '~/api/api-contract/token/price';

import { IconDown } from '~/assets/icons';

import { EVM_CONTRACT_ADDRESS, XRP_AMM } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { InputNumber } from '~/components/inputs';
import { Token } from '~/components/token';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { formatFloat, formatNumber } from '~/utils';
import { useSwapStore } from '~/states/pages';
import { POPUP_ID } from '~/types/components';

import { SelectFromTokenPopup } from './select-token-from-popup';
import { SelectToTokenPopup } from './select-token-to-popup';
import { SwapArrowDown } from './swap-arrow-down';
import { SwapPopup } from './swap-popup';

interface InputFormState {
  from: number;
  to: number;
}
export const SwapInputGroup = () => {
  const { selectedNetwork } = useNetwork();
  // TODO: 추후 스왑 가능한 토큰 / 풀을 서버 api로 받아오도록 수정
  const id = EVM_CONTRACT_ADDRESS[selectedNetwork]?.VAULT || XRP_AMM[0]?.id || '';

  const { pool } = useLiquidityPoolBalance(id);
  const { evm, xrp } = useConnectedWallet();
  const { balancesMap } = useTokenBalanceInPool();
  const { getTokenPrice } = useTokenPrice();

  const {
    fromToken,
    fromValue,
    toToken,

    setFromToken,
    setFromValue,
    setToToken,
    resetFromValue,
  } = useSwapStore();

  // TODO: 3 pool case
  // TODO: swap, 내부 브릿지 통합
  const fromReserve = pool?.compositions?.[0]?.balance ?? 0;
  const toReserve = pool?.compositions?.[1]?.balance ?? 0;

  const fromTokenBalance = balancesMap?.[fromToken]?.balance ?? 0;
  const toTokenBalance = balancesMap?.[toToken]?.balance ?? 0;

  const fromTokenPrice = getTokenPrice(fromToken);
  const toTokenPrice = getTokenPrice(toToken);

  const schema = yup.object().shape({
    from: yup.number().min(0).max(fromTokenBalance, 'Exceeds wallet balance').required(),
    to: yup.number().min(0).max(toTokenBalance, 'Exceeds wallet balance').required(),
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

  const address = evm?.address ?? xrp?.address;

  // TODO: fee 하드코딩 제거
  const fee = 0.003;

  const toValue = fromValue
    ? Number(
        formatFloat(
          toReserve - toReserve * (fromReserve / (fromReserve + Number(fromValue) * (1 - fee))),
          8
        )
      )
    : undefined;

  const swapRatio =
    fromValue == 0 || toValue == 0
      ? toReserve - toReserve * (fromReserve / (fromReserve + (1 - fee)))
      : (toValue ?? 0) / Number(fromValue === 0 ? 0.0001 : fromValue);

  const validToSwap =
    !!address &&
    fromValue &&
    Number(fromValue) > 0 &&
    Number(fromValue) <= fromTokenBalance &&
    toValue &&
    toValue > 0;

  const arrowClick = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  useEffect(
    () => resetFromValue(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fromToken, toToken]
  );

  return (
    <>
      <Wrapper>
        {address ? (
          <InputWrapper>
            <InputInnerWrapper>
              <InputNumber
                token={<Token token={fromToken} icon={<IconDown />} />}
                balance={fromTokenBalance}
                tokenValue={fromTokenPrice * (Number(fromValue) || 0)}
                value={fromValue}
                maxButton
                slider
                handleChange={setFromValue}
                handleTokenClick={openSelectTokenFromPopup}
                name={'from'}
                control={control}
                setValue={setValue}
                formState={formState}
              />
              <IconWrapper onClick={() => arrowClick()}>
                <SwapArrowDown />
              </IconWrapper>
              <InputNumber
                disabled
                token={<Token token={toToken} icon={<IconDown />} />}
                tokenValue={toTokenPrice * (Number(toValue) || 0)}
                balance={toTokenBalance}
                value={toValue}
                focus={false}
                handleTokenClick={openSelectTokenToPopup}
                name={'to'}
                control={control}
                setValue={setValue}
                formState={formState}
              />
            </InputInnerWrapper>
            <InputLabel>{`1 ${fromToken} = ${formatNumber(swapRatio, 6)} ${toToken}`}</InputLabel>
          </InputWrapper>
        ) : (
          // TODO: component 수정
          <Empty>please connect wallet</Empty>
        )}
        <ButtonPrimaryLarge text="Preview" disabled={!validToSwap} onClick={openSwapPopup} />
      </Wrapper>
      {address && selectTokenFromPopupOpened && <SelectFromTokenPopup />}
      {address && selectTokenToPopupOpened && <SelectToTokenPopup />}
      {address && swapPopupOpened && <SwapPopup />}
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
  absolute absolute-center-x bottom-100 z-1 clickable
`;

const InputLabel = tw.div`
  flex justify-end font-r-12 text-neutral-60
`;

const Empty = tw.div`
  flex-center font-r-16 text-neutral-60
`;
