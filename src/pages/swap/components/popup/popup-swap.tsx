import { format } from 'date-fns';
import { useState } from 'react';
import tw, { css, styled } from 'twin.macro';
import { parseUnits } from 'viem';

import { useSwap } from '~/api/api-contract/swap/swap';
import { useTokenApprove } from '~/api/api-contract/token/approve';
import { COLOR } from '~/assets/colors';
import { IconCheck, IconLink, IconTime } from '~/assets/icons';
import { ButtonChipSmall } from '~/components/buttons/chip';
import { ButtonPrimaryLarge } from '~/components/buttons/primary';
import { List } from '~/components/lists';
import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';
import {
  CHAIN,
  CONTRACT_ADDRESS,
  SCANNER_URL,
  TOKEN_ADDRESS,
  TOKEN_IMAGE_MAPPER,
  TOKEN_USD_MAPPER,
} from '~/constants';
import { useConnectWallet } from '~/hooks/data/use-connect-wallet';
import { useGetRootPrice } from '~/hooks/data/use-root-price';
import { usePopup } from '~/hooks/pages/use-popup';
import { useSlippageStore } from '~/states/data/slippage';
import { POPUP_ID } from '~/types/components';
import { SwapKind } from '~/types/contracts';
import { formatNumber } from '~/utils/number';
import { DATE_FORMATTER } from '~/utils/time';

import { useSwapData } from '../../hooks/use-swap-data';
import { SwapArrowDown } from '../arrow-down';

export const PopupSwap = () => {
  const { address } = useConnectWallet();
  const { fromToken, fromValue, toToken, toValue, swapRatio, poolId, resetAll } = useSwapData();
  const { close } = usePopup(POPUP_ID.SWAP);
  const { slippageId } = useSlippageStore();
  const rootPrice = useGetRootPrice();
  const isRoot = CHAIN === 'root';
  const decimals = isRoot ? 6 : 18;

  const [selectedDetailInfo, selectDetailInfo] = useState<'TOKEN' | 'USD'>('TOKEN');

  const {
    allow: allowToken,
    allowance: allowance,
    isLoading: allowLoading,
  } = useTokenApprove({
    enabled: !!fromToken,
    amount: Number(fromValue ?? 0),
    allowanceMin: Number(fromValue ?? 0),
    spender: CONTRACT_ADDRESS.VAULT,
    tokenAddress: TOKEN_ADDRESS[fromToken],
  });

  const { data, blockTimestamp, isLoading, isSuccess, error, swap } = useSwap({
    singleSwap: [
      poolId,
      SwapKind.GivenIn,
      TOKEN_ADDRESS[fromToken],
      TOKEN_ADDRESS[toToken],
      parseUnits(`${fromValue ?? 0}`, decimals),
      '0x',
    ],
    fundManagement: [address ?? '0x', false, address ?? '0x', false],
    enabled: allowance,
  });

  // const timestamp = txData
  const handleLink = () => {
    window.open(`${SCANNER_URL}/tx/${data?.hash ?? ''}`);
  };

  const numFromValue = Number(fromValue) || 0;
  const effectivePrice = `1 ${fromToken} = ${formatNumber(swapRatio, 6)} ${toToken}`;
  const fromUSDValue =
    numFromValue * (fromToken == 'ROOT' ? rootPrice : TOKEN_USD_MAPPER[fromToken]);
  const toUSDValue = numFromValue * (toToken == 'ROOT' ? rootPrice : TOKEN_USD_MAPPER[toToken]);

  const currentValue = selectedDetailInfo === 'TOKEN' ? numFromValue : fromUSDValue;
  const currentUnit = selectedDetailInfo === 'TOKEN' ? fromToken : 'USD';

  const totalAfterFee = (1 - 0.005) * (currentValue ?? 0);
  const slippage = slippageId === 0 ? 0.005 : slippageId === 1 ? 0.1 : 0.2;
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
      <ButtonPrimaryLarge
        buttonType="outlined"
        text="Return to swap page"
        onClick={handleSuccess}
      />
    </PrimaryButtonWrapper>
  ) : allowance ? (
    <ButtonPrimaryLarge
      text="Confirm swap"
      isLoading={isLoading}
      onClick={swap}
      disabled={!!error}
    />
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
