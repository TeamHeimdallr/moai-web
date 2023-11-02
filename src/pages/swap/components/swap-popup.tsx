import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import tw, { css, styled } from 'twin.macro';

import { useLiquidityPoolBalance } from '~/api/api-contract/pool/get-liquidity-pool-balance';
import { useSwap } from '~/api/api-contract/swap/swap';
import { useApprove } from '~/api/api-contract/token/approve';
import { useTokenPrice } from '~/api/api-contract/token/price';

import { COLOR } from '~/assets/colors';
import { IconCheck, IconLink, IconTime } from '~/assets/icons';

import {
  EVM_CONTRACT_ADDRESS,
  EVM_POOL,
  EVM_TOKEN_ADDRESS,
  SCANNER_URL,
  TOKEN_IMAGE_MAPPER,
  XRP_AMM,
  XRP_TOKEN_ISSUER,
} from '~/constants';

import { ButtonChipSmall, ButtonPrimaryLarge } from '~/components/buttons';
import { List } from '~/components/lists';
import { LoadingStep } from '~/components/loadings';
import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { DATE_FORMATTER, formatFloat, formatNumber, getNetworkFull } from '~/utils';
import { useSlippageStore } from '~/states/data';
import { useSwapStore } from '~/states/pages';
import { POPUP_ID } from '~/types/components';

import { SwapArrowDown } from './swap-arrow-down';

export const SwapPopup = () => {
  const { network } = useParams();
  const { selectedNetwork, isXrp } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  // TODO: 추후 스왑 가능한 토큰 / 풀을 서버 api로 받아오도록 수정
  const id = EVM_POOL?.[currentNetwork]?.[0]?.id || XRP_AMM?.[0]?.id || '';

  const { pool } = useLiquidityPoolBalance(id);
  const { getTokenPrice } = useTokenPrice();

  const {
    fromToken,
    fromValue,
    toToken,

    resetAll,
  } = useSwapStore();

  const fromReserve = pool?.compositions?.find(c => c.symbol === fromToken)?.balance ?? 0;
  const toReserve = pool?.compositions?.find(c => c.symbol === toToken)?.balance ?? 0;

  // TODO: fee 하드코딩 제거
  const fee = 0.003;

  const toValue =
    fromToken && toToken
      ? fromValue
        ? Number(
            formatFloat(
              toReserve - toReserve * (fromReserve / (fromReserve + Number(fromValue) * (1 - fee))),
              8
            )
          )
        : undefined
      : undefined;

  const swapRatio =
    fromValue && toValue
      ? (toValue || 0) / (Number(fromValue || 0) === 0 ? 0.0001 : Number(fromValue || 0))
      : toReserve - toReserve * (fromReserve / (fromReserve + (1 - fee)));

  const { close } = usePopup(POPUP_ID.SWAP);
  const { slippage } = useSlippageStore();

  const [selectedDetailInfo, selectDetailInfo] = useState<'TOKEN' | 'USD'>('TOKEN');

  const wantToAllowToken = isXrp ? toToken : fromToken;
  const wantToAllowAmount = isXrp ? toValue : fromValue;

  const {
    allow,
    isLoading: isLoadingAllowance,
    isSuccess: isSuccessAllowance,
  } = useApprove({
    amount: Number(wantToAllowAmount ?? 0),
    address: EVM_TOKEN_ADDRESS?.[currentNetwork]?.[wantToAllowToken] ?? '',
    issuer: XRP_TOKEN_ISSUER?.[wantToAllowToken] ?? '',

    spender: EVM_CONTRACT_ADDRESS?.[currentNetwork]?.VAULT ?? '',
    currency: wantToAllowToken ?? '',

    enabled: !!wantToAllowToken,
  });

  const { txData, blockTimestamp, isLoading, isSuccess, isError, swap } = useSwap({
    id,
    fromToken,
    fromValue: Number(fromValue),
    toToken,
    toValue,
    proxyEnabled: isSuccessAllowance,
  });

  const handleLink = () => {
    const txHash = isXrp ? txData?.hash : txData?.transactionHash;
    const url =
      `${SCANNER_URL[currentNetwork]}` + (isXrp ? '/transactions/' : 'tx') + `${txHash ?? ''}`;
    window.open(url);
  };

  const step = useMemo(() => {
    if (isSuccess) {
      return 3;
    }
    if (!isSuccessAllowance) return 1;
    return 2;
  }, [isSuccessAllowance, isSuccess]);

  const numFromValue = Number(fromValue) || 0;
  const numToValue = Number(toValue) || 0;
  const effectivePrice = `1 ${fromToken} = ${formatNumber(swapRatio, 6)} ${toToken}`;

  const fromUSDValue = numFromValue * getTokenPrice(fromToken);
  const toUSDValue = numToValue * getTokenPrice(toToken);

  const currentValue = selectedDetailInfo === 'TOKEN' ? numFromValue : fromUSDValue;
  const currentUnit = selectedDetailInfo === 'TOKEN' ? fromToken : 'USD';

  const totalAfterFee = (1 - 0.005) * (currentValue ?? 0);
  const slippageText = (slippage * 100).toFixed(1);
  const totalAfterSlippage = (1 - slippage / 100) * totalAfterFee;

  const handleButton = async () => {
    if (isSuccess) {
      resetAll();
      close();
      return;
    }

    if (step === 1) {
      await allow?.();
      return;
    }
    if (step === 2) {
      await swap?.();
      return;
    }
  };

  return (
    <Popup
      id={POPUP_ID.SWAP}
      title={isSuccess ? '' : 'Swap preview'}
      button={
        <ButtonWrapper onClick={() => handleButton()}>
          <ButtonPrimaryLarge
            text={
              isLoading || isLoadingAllowance
                ? 'Confirming'
                : isSuccess
                ? 'Return to swap page'
                : step === 1
                ? `Approve ${wantToAllowToken} for swap`
                : 'Confirm swap'
            }
            isLoading={isLoading || isLoadingAllowance}
            buttonType={isSuccess ? 'outlined' : 'filled'}
            disabled={!isLoading && !isLoadingAllowance && step == 2 && isError}
          />
        </ButtonWrapper>
      }
    >
      <Wrapper>
        {isSuccess ? (
          <>
            <SuccessWrapper>
              <SuccessIconWrapper>
                <IconCheck width={40} height={40} />
              </SuccessIconWrapper>
              <SuccessTitle>Swap confirmed!</SuccessTitle>
              <SuccessSubTitle>{`Successfully swapped ${fromValue} ${fromToken} to ${toValue} ${toToken}`}</SuccessSubTitle>
            </SuccessWrapper>

            <List title={`Total`}>
              <TokenList
                title={`${toValue} ${toToken}`}
                description={`$${formatNumber(toUSDValue, 2)}`}
                image={TOKEN_IMAGE_MAPPER[toToken]}
                type="large"
                leftAlign
              />
            </List>
          </>
        ) : (
          <>
            <ListWrapper>
              <List title={`Effective price: ${effectivePrice}`}>
                <TokenList
                  title={`${fromValue} ${fromToken}`}
                  description={`$${formatNumber(fromUSDValue, 2)}`}
                  image={TOKEN_IMAGE_MAPPER[fromToken]}
                  type="large"
                  leftAlign
                />
                <Divider />
                <IconWrapper>
                  <SwapArrowDown />
                </IconWrapper>
                <TokenList
                  title={`${toValue} ${toToken}`}
                  description={`$${formatNumber(toUSDValue, 2)}`}
                  image={TOKEN_IMAGE_MAPPER[toToken]}
                  type="large"
                  leftAlign
                />
              </List>
            </ListWrapper>

            <DetailWrapper>
              <DetailTitleWrapper>
                {`Swap from ${fromToken} details`}
                <DetailButtonWrapper>
                  <ButtonChipSmall
                    text="TOKEN"
                    selected={selectedDetailInfo === 'TOKEN'}
                    onClick={() => selectDetailInfo('TOKEN')}
                  />
                  <ButtonChipSmall
                    text="USD"
                    selected={selectedDetailInfo === 'USD'}
                    onClick={() => selectDetailInfo('USD')}
                  />
                </DetailButtonWrapper>
              </DetailTitleWrapper>
              <DetailInfoWrapper>
                <DetailInfoTextWrapper>
                  <DetailInfoText>Total expected after fees</DetailInfoText>
                  <DetailInfoText>{`${formatNumber(
                    totalAfterFee,
                    6
                  )} ${currentUnit}`}</DetailInfoText>
                </DetailInfoTextWrapper>
                <DetailInfoTextWrapper>
                  <DetailInfoSubtext>{`The least you'll get at ${slippageText}% slippage`}</DetailInfoSubtext>
                  <DetailInfoSubtext>{`${formatNumber(
                    totalAfterSlippage,
                    6
                  )} ${currentUnit}`}</DetailInfoSubtext>
                </DetailInfoTextWrapper>
              </DetailInfoWrapper>
            </DetailWrapper>
          </>
        )}
        {step < 3 ? (
          <LoadingStep
            totalSteps={2}
            step={step}
            isLoading={step === 1 ? isLoadingAllowance : isLoading}
            isDone={isSuccess}
          />
        ) : (
          <TimeWrapper>
            <IconTime />
            {format(new Date(blockTimestamp), DATE_FORMATTER.FULL)}
            <ClickableIcon onClick={handleLink}>
              <IconLink />
            </ClickableIcon>
          </TimeWrapper>
        )}
      </Wrapper>
    </Popup>
  );
};

const Wrapper = tw.div`
  px-24 pb-24 flex flex-col gap-24
`;

const SuccessTitle = tw.div`
  text-neutral-100 font-b-24
`;

const SuccessSubTitle = tw.div`
  text-neutral-80 font-r-16
`;

const SuccessWrapper = tw.div`
  flex-center flex-col gap-12
`;

const SuccessIconWrapper = tw.div`
  flex-center w-48 h-48 rounded-full bg-green-50
`;

const ListWrapper = tw.div`
  relative
`;

const IconWrapper = tw.div`
  absolute right-12 bottom-56 z-1
`;

const DetailWrapper = tw.div`
  flex flex-col gap-16
`;

const DetailTitleWrapper = tw.div`
  px-12 flex items-center justify-between gap-12 font-m-16 text-neutral-100
`;

const DetailButtonWrapper = tw.div`
  flex gap-4
`;

const DetailInfoWrapper = tw.div`
  px-16 py-12 bg-neutral-15 rounded-8 flex flex-col gap-2
`;

const DetailInfoTextWrapper = tw.div`
  flex gap-10
`;

const DetailInfoText = tw.div`
  font-r-14 text-neutral-100
`;

const DetailInfoSubtext = tw.div`
  font-r-12 text-neutral-60
`;
const Divider = tw.div`
  w-full h-1 bg-neutral-20 flex-shrink-0
`;

const ButtonWrapper = tw.div`
  w-full
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
