import { Fragment, useEffect } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { useNavigate } from 'react-router-dom';
import tw from 'twin.macro';

import { useAddLiquidity } from '~/api/api-contract/pool/add-liquiditiy';
import { useApprove } from '~/api/api-contract/token/approve';
import { useGetPoolVaultAmmQuery } from '~/api/api-server/pools/get-pool-vault-amm';

import { COLOR } from '~/assets/colors';
import { IconCheck, IconLink, IconTime } from '~/assets/icons';

import { SCANNER_URL } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { List } from '~/components/lists';
import { LoadingStep } from '~/components/loadings/step';
import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { formatNumber, getNetworkAbbr } from '~/utils';
import { IPool, ITokenComposition, POPUP_ID } from '~/types';

interface Props {
  pool?: IPool;
  tokensIn?: (ITokenComposition & { balance: number; amount: number })[];

  lpTokenPrice: number;
  bptOut: number;
  priceImpact: string;
}
export const AddLiquidityPopup = ({ tokensIn, pool, lpTokenPrice, bptOut, priceImpact }: Props) => {
  const navigate = useNavigate();

  const { selectedNetwork, isXrp } = useNetwork();

  const { close } = usePopup(POPUP_ID.ADD_LP);

  const { network, poolId, lpToken } = pool || {};
  const { data: poolVaultAmmData } = useGetPoolVaultAmmQuery(
    {
      params: {
        networkAbbr: getNetworkAbbr(network),
        poolId: poolId || '',
      },
    },
    {
      enabled: !!network && !!poolId,
      cacheTime: Infinity,
      staleTime: Infinity,
    }
  );
  const currentNetwork = network ?? selectedNetwork;
  const tokenLength = tokensIn?.length || 0;

  const { poolVaultAmm } = poolVaultAmmData || {};
  const { vault } = poolVaultAmm || {};

  const {
    allow: allowToken1,
    allowance: allowance1,
    isLoading: allowLoading1,
    isSuccess: allowSuccess1,
    refetch: refetchAllowance1,
  } = useApprove({
    amount: tokensIn?.[0]?.amount || 0,
    address: tokensIn?.[0]?.address || '',
    issuer: tokensIn?.[0]?.address || '',
    spender: vault || '',
    currency: tokensIn?.[0]?.currency || '',
    enabled: tokenLength > 0,
  });

  const {
    allow: allowToken2,
    allowance: allowance2,
    isLoading: allowLoading2,
    isSuccess: allowSuccess2,
    refetch: refetchAllowance2,
  } = useApprove({
    amount: tokensIn?.[1]?.amount || 0,
    address: tokensIn?.[1]?.address || '',
    issuer: tokensIn?.[1]?.address || '',
    spender: vault || '',
    currency: tokensIn?.[1]?.currency || '',
    enabled: tokenLength > 1,
  });

  const getEnabled = () => {
    const validAmount = (tokensIn?.[0]?.amount || 0) > 0 && (tokensIn?.[1]?.amount || 0) > 0;
    const validAllowance = tokenLength < 2 ? allowance1 : allowance1 && allowance2;

    return validAmount && validAllowance;
  };

  const { isLoading, isSuccess, txData, blockTimestamp, writeAsync } = useAddLiquidity({
    id: poolId || '',
    tokens: tokensIn || [],
    enabled: getEnabled(),
  });

  const getStep = () => {
    if (isSuccess) {
      return tokenLength + 1;
    }

    if (!allowance1) return 1;
    if (!allowance2 && tokenLength > 1) return 2;

    return tokenLength + 1;
  };
  const step = getStep();
  const txDate = new Date(blockTimestamp ?? 0);

  const handleButton = async () => {
    if (isSuccess) {
      close();
      navigate(-1);
      return;
    }

    if (step === 1) {
      await allowToken1?.();
      return;
    }
    if (step === 2 && tokenLength > 1) {
      await allowToken2?.();
      return;
    }
    await writeAsync?.();
  };

  useEffect(() => {
    if (allowSuccess1) {
      refetchAllowance1();
      return;
    }
    if (allowSuccess2) {
      refetchAllowance2();
      return;
    }
  }, [allowSuccess1, allowSuccess2, refetchAllowance1, refetchAllowance2]);

  const handleLink = () => {
    const txHash = isXrp ? txData?.hash : txData?.transactionHash;
    const url = `${SCANNER_URL[currentNetwork]}/${isXrp ? 'transactions' : 'tx'}/${txHash}`;
    window.open(url);
  };

  return (
    <Popup
      id={POPUP_ID.ADD_LP}
      title={isSuccess ? '' : 'Add liquidity preview'}
      button={
        <ButtonWrapper onClick={() => handleButton()}>
          <ButtonPrimaryLarge
            text={
              isLoading
                ? 'Confirming'
                : isSuccess
                ? 'Return to pool page'
                : step === 1
                ? `Approve ${tokensIn?.[0]?.symbol} for adding liquidity`
                : step === 2 && tokenLength > 1
                ? `Approve ${tokensIn?.[1]?.symbol} for adding liquidity`
                : 'Add liquidity'
            }
            isLoading={isLoading}
            buttonType={isSuccess ? 'outlined' : 'filled'}
          />
        </ButtonWrapper>
      }
    >
      <Wrapper>
        {isSuccess && (
          <SuccessWrapper>
            <IconWrapper>
              <IconCheck width={40} height={40} />
            </IconWrapper>
            <SuccessTitle>Add liquidity confirmed!</SuccessTitle>
            <SuccessSubTitle>{`Successfully added liquidity to ${lpToken?.symbol} Pool`}</SuccessSubTitle>
          </SuccessWrapper>
        )}
        {!isSuccess && (
          <List title={`You're providing`}>
            {tokensIn?.map(({ symbol, image, amount, price }, idx) => (
              <Fragment key={`${symbol}-${idx}`}>
                <TokenList
                  type="large"
                  title={`${amount}`}
                  subTitle={symbol}
                  description={`$${formatNumber(amount * (price || 0), 4)}`}
                  image={image}
                  leftAlign
                />
                {idx !== tokenLength - 1 && <Divider />}
              </Fragment>
            ))}
          </List>
        )}
        <List title={`You're expected to receive`}>
          <TokenList
            type="large"
            title={`${bptOut}`}
            subTitle={`${lpToken?.symbol || ''}`}
            description={`$${formatNumber(bptOut * lpTokenPrice, 6)}`}
            image={<Jazzicon diameter={36} seed={jsNumberForAddress(lpToken?.address || '')} />}
            leftAlign={true}
          />
        </List>
        {isSuccess && (
          <Scanner onClick={() => handleLink()}>
            <IconTime width={20} height={20} fill={COLOR.NEUTRAL[40]} />
            <ScannerText>{txDate.toString()}</ScannerText>
            <IconLink width={20} height={20} fill={COLOR.NEUTRAL[40]} />
          </Scanner>
        )}{' '}
        {!isSuccess && (
          <>
            <List title={`Summary`}>
              <Summary>
                <SummaryTextTitle>Total</SummaryTextTitle>
                <SummaryText>{`$${formatNumber(bptOut * lpTokenPrice, 6)}`}</SummaryText>
              </Summary>
              <Summary>
                <SummaryTextTitle>Price impact</SummaryTextTitle>
                <SummaryText>{priceImpact}%</SummaryText>
              </Summary>
            </List>

            <LoadingStep
              totalSteps={tokenLength + 1}
              step={step}
              isLoading={
                step === 1
                  ? allowLoading1
                  : step === 2 && tokenLength > 1
                  ? allowLoading2
                  : isLoading
              }
              isDone={isSuccess}
            />
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
  flex flex-col gap-24 px-24 py-0
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
