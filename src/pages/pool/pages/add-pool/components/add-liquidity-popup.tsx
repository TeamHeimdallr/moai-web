import { Fragment, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import objectHash from 'object-hash';
import tw, { styled } from 'twin.macro';
import { toHex } from 'viem';

import { useAccountInfo } from '~/api/api-contract/_xrpl/account/account-info';
import { useAmmCreate } from '~/api/api-contract/_xrpl/amm/amm-create';
import { useAmmInfo } from '~/api/api-contract/_xrpl/amm/amm-info';
import { useUserAllTokenBalances } from '~/api/api-contract/balance/user-all-token-balances';
import { useCreatePoolXrplMutate } from '~/api/api-server/pools/create-pool';

import { COLOR } from '~/assets/colors';
import { IconCancel, IconCheck, IconLink, IconTime } from '~/assets/icons';

import { SCANNER_URL, THOUSAND } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { List } from '~/components/lists';
import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';

import { usePopup } from '~/hooks/components';
import { useMediaQuery } from '~/hooks/utils';
import { DATE_FORMATTER, formatNumber, tokenToAmmAsset, tokenToAmmAssetWithValue } from '~/utils';
import { ITokenComposition, NETWORK, POPUP_ID } from '~/types';

import { useXrplPoolAddTokenPairStore } from '../states/token-pair';

interface Props {
  tokensIn?: (ITokenComposition & { balance: number; amount: number })[];
}

export const AddLiquidityPopup = ({ tokensIn }: Props) => {
  const { userAllTokenBalances } = useUserAllTokenBalances();
  const { initialFee } = useXrplPoolAddTokenPairStore();

  const xrp = userAllTokenBalances?.find(t => t.symbol === 'XRP');
  const xrpBalance = xrp?.balance || 0;

  const navigate = useNavigate();

  const { t } = useTranslation();

  const { isMD } = useMediaQuery();

  const { close } = usePopup(POPUP_ID.XRPL_ADD_LIQUIDITY_POPUP);

  const token1Amount = tokensIn?.[0]?.amount || 0;
  const token2Amount = tokensIn?.[1]?.amount || 0;

  // const bptOut = Math.sqrt((_input1 || 0) * (_input2 || 0));

  const validAmount = token1Amount > 0 || token2Amount > 0;
  const addLiquidityEnabled = validAmount;

  const {
    isLoading: ammCreateLoading,
    isSuccess: ammCreateSuccess,
    txData,
    blockTimestamp,
    writeAsync,
    estimateFee,
  } = useAmmCreate({
    asset: tokenToAmmAssetWithValue(tokensIn?.[0]),
    asset2: tokenToAmmAssetWithValue(tokensIn?.[1]),
    trandingFee: initialFee || 0,
    enabled: addLiquidityEnabled,
  });

  const { isLoading: accountInfo1Loading, accountInfo: _accountInfo1 } = useAccountInfo({
    account: tokensIn?.[0]?.address || '',
    enabled: !!tokensIn?.[0]?.address,
  });
  const { isLoading: accountInfo2Loading, accountInfo: _accountInfo2 } = useAccountInfo({
    account: tokensIn?.[0]?.address || '',
    enabled: !!tokensIn?.[0]?.address,
  });

  const accountInfo1TransferRate = _accountInfo1?.account_data?.TransferRate || 0;
  const accountInfo2TransferRate = _accountInfo2?.account_data?.TransferRate || 0;

  const { data: ammInfo } = useAmmInfo({
    asset: tokenToAmmAsset(tokensIn?.[0]),
    asset2: tokenToAmmAsset(tokensIn?.[1]),
    enabled: ammCreateSuccess && !!txData,
  });

  const ammAccount = ammInfo?.amm?.account || '';
  const {
    data,
    mutateAsync: createPool,
    isLoading: createPoolLoading,
    isSuccess: createPoolSuccess,
  } = useCreatePoolXrplMutate();

  const effectHash = objectHash([tokensIn?.[0], tokensIn?.[1]]);
  const created = data?.account || '';

  const txDate = new Date(blockTimestamp || 0);
  const isIdle = !txData || !created;
  const isLoading = createPoolLoading || ammCreateLoading;
  const isSuccess = createPoolSuccess && ammCreateSuccess;

  useEffect(() => {
    if (!ammAccount || !tokensIn?.[0] || !tokensIn?.[1] || isLoading || isSuccess || !!created)
      return;

    const _createPool = async () => {
      await createPool({
        token1: tokensIn?.[0],
        token2: tokensIn?.[1],
      });
    };

    _createPool();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectHash, ammAccount, isLoading, isSuccess, created]);

  const buttonText = useMemo(() => {
    if (!isIdle) {
      if (isSuccess) return t('Return to pool page');
      return t('Try again');
    }

    if (isLoading) return t('Confirm pool creationl in wallet');
    return t('Create a pool');
  }, [isIdle, isLoading, isSuccess, t]);

  const handleButtonClick = async () => {
    if (isLoading) return;
    if (!isIdle) {
      if (isSuccess) {
        close();
        navigate(`/pools/xrpl/${created}`);
        return;
      }
      close();
      return;
    }

    return await writeAsync?.();
  };

  const handleLink = () => {
    const txHash = txData?.hash;
    const url = `${SCANNER_URL[NETWORK.XRPL]}/transactions/${txHash}`;

    window.open(url);
  };

  const estimatedFee = estimateFee?.() || 0.0005;

  const validMaxXrpAmount =
    tokensIn?.[0]?.symbol === 'XRP'
      ? token1Amount + Number(estimatedFee || 0.0005) < xrpBalance
      : tokensIn?.[1]?.symbol === 'XRP'
      ? token2Amount + Number(estimatedFee || 0.0005) < xrpBalance
      : true;

  const gasError = xrpBalance <= Number(estimatedFee || 0.0005) || !validMaxXrpAmount;
  const bptOut = Math.sqrt((tokensIn?.[0]?.amount || 0) * (tokensIn?.[1]?.amount || 0));
  const lpTokenSymbol = `${tokensIn?.[0]?.symbol || ''}-${tokensIn?.[1]?.symbol || ''}`;
  const lpTokenValue =
    !tokensIn?.[0]?.price || !tokensIn?.[1]?.price
      ? undefined
      : (tokensIn?.[0]?.amount || 0) * (tokensIn?.[0]?.price || 0) +
        (tokensIn?.[1]?.amount || 0) * (tokensIn?.[1]?.price || 0);

  return (
    <Popup
      id={POPUP_ID.XRPL_ADD_LIQUIDITY_POPUP}
      title={isIdle ? t('Create a pool preview') : ''}
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
      <Wrapper style={{ gap: isIdle ? (isMD ? 24 : 20) : 40 }}>
        {!isIdle && isSuccess && (
          <SuccessWrapper>
            <IconWrapper>
              <IconCheck width={40} height={40} />
            </IconWrapper>
            <SuccessTitle>{t('Pool creation confirmed!')}</SuccessTitle>
            <SuccessSubTitle>
              {t('xrpl-pool-creation-success-message', { pool: lpTokenSymbol })}
            </SuccessSubTitle>
          </SuccessWrapper>
        )}
        {!isIdle && !isSuccess && (
          <FailedWrapper style={{ paddingBottom: '24px' }}>
            <FailedIconWrapper>
              <IconCancel width={40} height={40} />
            </FailedIconWrapper>
            <SuccessTitle>{t('Pool creation failed')}</SuccessTitle>
            <SuccessSubTitle>{t('xrpl-pool-creation-fail-message')}</SuccessSubTitle>
          </FailedWrapper>
        )}
        {isIdle && (
          <>
            <List title={t(`You're providing`)}>
              {tokensIn?.map(({ symbol, image, amount, price }, idx) => (
                <Fragment key={`${symbol}-${idx}`}>
                  <TokenList
                    type="large"
                    title={`${formatNumber(amount, 6, 'floor', THOUSAND, 0)} ${symbol}`}
                    description={price ? `$${formatNumber(amount * (price || 0))}` : undefined}
                    image={image}
                    leftAlign
                  />
                  {idx !== tokensIn.length - 1 && <Divider />}
                </Fragment>
              ))}
            </List>
            <List title={t(`You're expected to receive`)}>
              <TokenList
                type="large"
                title={`${formatNumber(bptOut, 4, 'floor', THOUSAND, 0)}`}
                subTitle={lpTokenSymbol}
                description={lpTokenValue ? `$${formatNumber(lpTokenValue)}` : undefined}
                image={
                  <Jazzicon
                    diameter={36}
                    seed={jsNumberForAddress(toHex(lpTokenSymbol || '', { size: 42 }))}
                  />
                }
                leftAlign={true}
              />
            </List>
          </>
        )}
        {!isIdle && isSuccess && (
          <Scanner onClick={() => handleLink()}>
            <IconTime width={20} height={20} fill={COLOR.NEUTRAL[40]} />
            <ScannerText> {format(new Date(txDate), DATE_FORMATTER.FULL)}</ScannerText>
            <IconLink width={20} height={20} fill={COLOR.NEUTRAL[40]} />
          </Scanner>
        )}
        {isIdle && (
          <>
            <List title={t(`Summary`)}>
              <Summary>
                <SummaryTextTitle>{t('Total value')}</SummaryTextTitle>
                <SummaryText>{lpTokenValue ? `$${formatNumber(lpTokenValue)}` : '-$'}</SummaryText>
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

              <InfoWrapper>
                <GasFeeTitle>{t(`${tokensIn?.[0]?.symbol} transfer fee`)}</GasFeeTitle>
                <GasFeeTitleValue>
                  {!accountInfo1Loading && accountInfo1TransferRate
                    ? `${formatNumber(accountInfo1TransferRate)}%`
                    : '-%'}
                </GasFeeTitleValue>
              </InfoWrapper>

              <InfoWrapper>
                <GasFeeTitle>{t(`${tokensIn?.[1]?.symbol} transfer fee`)}</GasFeeTitle>
                <GasFeeTitleValue>
                  {!accountInfo2Loading && accountInfo2TransferRate
                    ? `${formatNumber(accountInfo2TransferRate)}%`
                    : '-%'}
                </GasFeeTitleValue>
              </InfoWrapper>
            </List>
          </>
        )}
      </Wrapper>
    </Popup>
  );
};

const Divider = tw.div`
  w-full h-1 flex-shrink-0 bg-neutral-20
`;

const Wrapper = tw.div`
  flex flex-col gap-20 px-20 py-0
  md:(gap-24 px-24)
`;

const SuccessTitle = tw.div`
  text-neutral-100 font-b-20
  md:font-b-24
`;

const SuccessSubTitle = tw.div`
  text-neutral-80 font-r-14
  md:font-r-16
`;

const SuccessWrapper = tw.div`
  flex-center flex-col gap-12
`;

const FailedWrapper = tw.div`
  flex-center flex-col gap-12
`;

const FailedIconWrapper = tw.div`
  flex-center w-48 h-48 rounded-full bg-red-50
`;

const IconWrapper = tw.div`
  flex-center w-48 h-48 rounded-full bg-green-50
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

const ButtonWrapper = tw.div`
  mt-16 w-full
`;

const Scanner = tw.div`
  flex items-start gap-4 clickable
`;

const ScannerText = tw.div`
  font-r-12 text-neutral-60
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

const InfoWrapper = tw.div`
  flex items-center justify-between py-6 px-16 last-of-type:pb-12
`;
