import { useEffect, useState } from 'react';
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
  const { selectedNetwork } = useNetwork();

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

  const fromReserve = pool?.compositions?.[0]?.balance ?? 0;
  const toReserve = pool?.compositions?.[1]?.balance ?? 0;

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

  const { close } = usePopup(POPUP_ID.SWAP);
  const { slippage } = useSlippageStore();

  const [selectedDetailInfo, selectDetailInfo] = useState<'TOKEN' | 'USD'>('TOKEN');

  const {
    allow: allowToken,
    allowance: allowance,
    isLoading: allowLoading,
    isSuccess: allowSuccess,
    refetch: refetchAllowance,
  } = useApprove({
    amount: Number(fromValue ?? 0),
    address: EVM_TOKEN_ADDRESS?.[currentNetwork]?.[fromToken] ?? '',
    issuer: XRP_TOKEN_ISSUER?.[fromToken]?.symbol ?? '',

    spender: EVM_CONTRACT_ADDRESS?.[currentNetwork]?.VAULT ?? '',
    currency: fromToken ?? '',

    enabled: !!fromToken,
  });

  const { txData, blockTimestamp, isLoading, isSuccess, swap } = useSwap({
    id,
    fromToken,
    fromValue: Number(fromValue),
    toToken,
    toValue,
  });

  useEffect(() => {
    if (allowSuccess) {
      refetchAllowance();
    }
  }, [allowSuccess, refetchAllowance]);

  const handleLink = () => {
    window.open(`${SCANNER_URL[currentNetwork]}/tx/${txData?.hash ?? ''}`);
  };

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

  const handleSuccess = () => {
    close();
    resetAll();
  };

  const SuccessIcon = (
    <SuccessIconWrapper>
      <IconCheck />
    </SuccessIconWrapper>
  );

  const Button = isSuccess ? (
    <PrimaryButtonWrapper>
      {blockTimestamp > 0 && (
        <TimeWrapper>
          <IconTime />
          {format(new Date(blockTimestamp), DATE_FORMATTER.FULL)}
          <ClickableIcon onClick={handleLink}>
            <IconLink />
          </ClickableIcon>
        </TimeWrapper>
      )}
      <ButtonPrimaryLarge buttonType="outlined" text="Close" onClick={handleSuccess} />
    </PrimaryButtonWrapper>
  ) : allowance ? (
    <ButtonPrimaryLarge text="Confirm swap" isLoading={isLoading} onClick={swap} />
  ) : (
    <ButtonPrimaryLarge
      text={`Approve ${fromToken} for swapping`}
      isLoading={allowLoading}
      onClick={allowToken}
    />
  );

  return (
    <Popup
      id={POPUP_ID.SWAP}
      title="Preview swap"
      icon={isSuccess ? SuccessIcon : undefined}
      button={Button}
    >
      <Wrapper>
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
              <DetailInfoText>{`${formatNumber(totalAfterFee, 6)} ${currentUnit}`}</DetailInfoText>
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
      </Wrapper>
    </Popup>
  );
};

const Wrapper = tw.div`
  px-24 pb-24 flex flex-col gap-24
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

const SuccessIconWrapper = styled.div(() => [
  tw`w-32 h-32 rounded-full flex-center bg-green-50`,
  css`
    & svg {
      width: 20px;
      height: 20px;
      fill: ${COLOR.NEUTRAL[100]};
    }
  `,
]);

const PrimaryButtonWrapper = tw.div`
  w-full flex flex-col gap-16
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
