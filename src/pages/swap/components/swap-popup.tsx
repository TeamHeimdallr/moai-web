import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import tw, { css, styled } from 'twin.macro';

import { useSwap } from '~/api/api-contract/swap/swap';
import { useApprove } from '~/api/api-contract/token/approve';
import { useGetPoolVaultAmmQuery } from '~/api/api-server/pools/get-pool-vault-amm';

import { COLOR } from '~/assets/colors';
import { IconArrowDown, IconCheck, IconLink, IconTime } from '~/assets/icons';

import { SCANNER_URL } from '~/constants';

import { ButtonChipSmall, ButtonPrimaryLarge } from '~/components/buttons';
import { List } from '~/components/lists';
import { LoadingStep } from '~/components/loadings';
import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { DATE_FORMATTER, formatFloat, formatNumber, getNetworkAbbr, getNetworkFull } from '~/utils';
import { useSlippageStore } from '~/states/data';
import { useSwapStore } from '~/states/pages';
import { IPool, IToken } from '~/types';
import { POPUP_ID } from '~/types/components';

interface Props {
  swapOptimizedPathPool?: IPool;
  userAllTokenBalances?: (IToken & { balance: number })[];
}
export const SwapPopup = ({ swapOptimizedPathPool, userAllTokenBalances }: Props) => {
  const { network } = useParams();
  const { selectedNetwork, isXrp, isEvm, isFpass } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);

  const { evm, xrp, fpass } = useConnectedWallet();
  const walletAddress = isFpass ? fpass?.address : isEvm ? evm?.address : xrp?.address;

  const { close } = usePopup(POPUP_ID.SWAP);
  const { slippage } = useSlippageStore();

  const [selectedDetailInfo, selectDetailInfo] = useState<'TOKEN' | 'USD'>('TOKEN');

  const {
    fromToken,
    toToken,

    fromInput,

    resetAll,
  } = useSwapStore();
  const numFromInput = Number(fromInput) || 0;

  const { data: poolVaultAmmData } = useGetPoolVaultAmmQuery(
    {
      params: {
        networkAbbr: currentNetworkAbbr,
        poolId: swapOptimizedPathPool?.poolId || '',
      },
    },
    {
      enabled: !!swapOptimizedPathPool && !!currentNetworkAbbr,
    }
  );
  const { poolVaultAmm } = poolVaultAmmData || {};
  const { vault } = poolVaultAmm || {};

  /* swap optimized path pool의 해당 토큰 balance와 price */
  const { balance: fromTokenReserveRaw } = swapOptimizedPathPool?.compositions?.find(
    c => c.symbol === fromToken?.symbol
  ) || {
    balance: 0,
    price: 0,
  };
  const fromTokenReserve = fromTokenReserveRaw || 0;
  /* swap 하고자 하는 토큰 유저 balance */
  const fromTokenBalance =
    userAllTokenBalances?.find(t => t.symbol === fromToken?.symbol)?.balance || 0;

  /* swap optimized path pool의 해당 토큰 balance와 price */
  const { balance: toTokenReserveRaw } = swapOptimizedPathPool?.compositions?.find(
    c => c.symbol === toToken?.symbol
  ) || {
    balance: 0,
    price: 0,
  };
  const toTokenReserve = toTokenReserveRaw || 0;

  const fee = swapOptimizedPathPool?.trandingFees || 0;

  const toInput =
    fromToken && toToken
      ? fromInput
        ? Number(
            formatFloat(
              toTokenReserve -
                toTokenReserve * (fromTokenReserve / (fromTokenReserve + numFromInput * (1 - fee))),
              6
            )
          )
        : undefined
      : undefined;
  const numToInput = Number(toInput) || 0;

  const swapRatio =
    fromInput && toInput
      ? numToInput / (numFromInput === 0 ? 0.0001 : numFromInput)
      : toTokenReserve - toTokenReserve * (fromTokenReserve / (fromTokenReserve + (1 - fee)));

  const validToSwap =
    !!walletAddress &&
    fromInput &&
    numFromInput > 0 &&
    numFromInput <= fromTokenBalance &&
    toInput &&
    toInput > 0;

  const wantToAllowToken = isXrp ? toToken : fromToken;
  const wantToAllowAmount = isXrp ? toInput : fromInput;
  const {
    allow,
    isLoading: isLoadingAllowance,
    isSuccess: isSuccessAllowance,
    allowance,
  } = useApprove({
    amount: Number(wantToAllowAmount || 0),
    address: wantToAllowToken?.address || '',
    issuer: wantToAllowToken?.address || '',

    spender: vault,
    currency: wantToAllowToken?.currency || '',

    enabled: !!wantToAllowToken,
  });

  const { txData, blockTimestamp, isLoading, isSuccess, isError, swap } = useSwap({
    id: swapOptimizedPathPool?.poolId || '',
    fromToken: fromToken,
    fromInput: numFromInput,
    toToken: toToken,
    toInput: numToInput,
    proxyEnabled: isSuccessAllowance,
  });

  const handleLink = () => {
    const txHash = isXrp ? txData?.hash : txData?.transactionHash;
    const url = `${SCANNER_URL[currentNetwork]}/${isXrp ? 'transactions' : 'tx'}/${txHash}`;

    window.open(url);
  };

  const step = useMemo(() => {
    if (isSuccess) return 3;
    if (isSuccessAllowance || allowance) return 2;
    return 1;
  }, [isSuccess, isSuccessAllowance, allowance]);

  const effectivePrice =
    fromToken && toToken && swapRatio
      ? `1 ${fromToken.symbol} = ${formatNumber(swapRatio, 6)} ${toToken.symbol}`
      : '';

  const fromValue =
    numFromInput *
    (swapOptimizedPathPool?.compositions?.find(c => c.symbol === fromToken?.symbol)?.price || 0);
  const toValue =
    numToInput *
    (swapOptimizedPathPool?.compositions?.find(c => c.symbol === toToken?.symbol)?.price || 0);

  const currentValue = selectedDetailInfo === 'TOKEN' ? numFromInput : fromValue;
  const currentUnit = selectedDetailInfo === 'TOKEN' ? fromToken?.symbol || '' : 'USD';
  const totalAfterFee = (1 - (swapOptimizedPathPool?.trandingFees || 0.003)) * (currentValue || 0);

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
        <ButtonWrapper onClick={handleButton}>
          <ButtonPrimaryLarge
            text={
              isLoading || isLoadingAllowance
                ? 'Confirming'
                : isSuccess
                ? 'Return to swap page'
                : step === 1
                ? `Approve ${wantToAllowToken?.symbol || ''} for swap`
                : 'Confirm swap'
            }
            isLoading={isLoading || isLoadingAllowance}
            buttonType={isSuccess ? 'outlined' : 'filled'}
            disabled={
              isLoading ||
              isLoadingAllowance ||
              // invalid to swap
              (step === 2 && !validToSwap) ||
              // swap contract call has error
              (step === 2 && isError)
            }
          />
        </ButtonWrapper>
      }
    >
      <Wrapper style={{ gap: isSuccess ? 40 : 24 }}>
        {isSuccess ? (
          <>
            <SuccessWrapper>
              <SuccessIconWrapper>
                <IconCheck width={40} height={40} />
              </SuccessIconWrapper>
              <SuccessTitle>Swap confirmed!</SuccessTitle>
              <SuccessSubTitle>{`Successfully swapped ${fromInput} ${fromToken?.symbol} to ${toInput} ${toToken?.symbol}`}</SuccessSubTitle>
            </SuccessWrapper>

            <List title={`Total`}>
              <TokenList
                title={`${toValue} ${toToken?.symbol}`}
                description={`$${formatNumber(toValue, 4)}`}
                image={toToken?.image}
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
                  title={`${fromValue} ${fromToken?.symbol}`}
                  description={`$${formatNumber(fromValue, 4)}`}
                  image={fromToken?.image}
                  type="large"
                  leftAlign
                />
                <Divider />
                <IconWrapper>
                  <ArrowDownWrapper>
                    <IconArrowDown width={20} height={20} fill={COLOR.PRIMARY[50]} />
                  </ArrowDownWrapper>
                </IconWrapper>
                <TokenList
                  title={`${toValue} ${toToken?.symbol}`}
                  description={`$${formatNumber(toValue, 4)}`}
                  image={toToken?.image}
                  type="large"
                  leftAlign
                />
              </List>
            </ListWrapper>

            <DetailWrapper>
              <DetailTitleWrapper>
                {`Swap from ${fromToken?.symbol} details`}
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
  px-24 pb-24 flex flex-col
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

const ArrowDownWrapper = tw.div`
  p-6 flex-center rounded-full bg-neutral-20
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
