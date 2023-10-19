import { useEffect, useMemo } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { useNavigate, useParams } from 'react-router-dom';
import tw from 'twin.macro';
import { parseUnits } from 'viem';
import { Address } from 'wagmi';

import { useLiquidityPoolTokenAmount } from '~/api/api-contract/_evm/pool/get-liquidity-pool-balance';
import { useAddLiquidity } from '~/api/api-contract/pool/add-liquiditiy';
import { useApprove } from '~/api/api-contract/token/approve';
import { useTokenPrice } from '~/api/api-contract/token/price';

import { COLOR } from '~/assets/colors';
import { IconCheck, IconLink, IconTime } from '~/assets/icons';

import {
  EVM_CONTRACT_ADDRESS,
  EVM_TOKEN_ADDRESS,
  SCANNER_URL,
  TOKEN_DECIMAL,
  TOKEN_IMAGE_MAPPER,
} from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { List } from '~/components/lists';
import { LoadingStep } from '~/components/loadings/step';
import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useRequirePrarams } from '~/hooks/utils';
import { formatNumber, getNetworkFull } from '~/utils';
import { IPool, POPUP_ID } from '~/types';

interface Props {
  pool: IPool;
  tokenInputs: {
    symbol: string;
    amount: number;
  }[];
  totalValue: number;
  priceImpact: string;
}

export const AddLiquidityPopup = ({ pool, tokenInputs, totalValue, priceImpact }: Props) => {
  const { network } = useParams();
  const { selectedNetwork } = useNetwork();
  const { getTokenPrice } = useTokenPrice();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const { bptOut: lpTokenAmountEvm } = useLiquidityPoolTokenAmount({
    id: pool.id as Address,
    amountsIn: tokenInputs?.map(v => v.amount) ?? [],
  });

  // TODO: handle 3 tokens
  const lpTokenAmountXrp = Math.sqrt(
    tokenInputs[0].amount * tokenInputs[0].amount + tokenInputs[1].amount * tokenInputs[1].amount
  ).toFixed(2);

  const lpTokenAmount = formatNumber(lpTokenAmountEvm || lpTokenAmountXrp || 0, 6);

  const {
    allow: allowToken1,
    allowance: allowance1,
    isLoading: allowLoading1,
    isSuccess: allowSuccess1,
    refetch: refetchAllowance1,
  } = useApprove({
    amount: tokenInputs?.[0]?.amount ?? 0,
    address: EVM_TOKEN_ADDRESS?.[currentNetwork]?.[tokenInputs?.[0]?.symbol] ?? '',

    spender: EVM_CONTRACT_ADDRESS?.[currentNetwork]?.VAULT ?? '',
    currency: tokenInputs?.[0]?.symbol ?? '',

    enabled: tokenInputs?.length > 0,
  });

  const {
    allow: allowToken2,
    allowance: allowance2,
    isLoading: allowLoading2,
    isSuccess: allowSuccess2,
    refetch: refetchAllowance2,
  } = useApprove({
    amount: tokenInputs?.[1]?.amount ?? 0,
    address: EVM_TOKEN_ADDRESS?.[currentNetwork]?.[tokenInputs?.[1]?.symbol] ?? '',

    spender: EVM_CONTRACT_ADDRESS?.[currentNetwork]?.VAULT ?? '',
    currency: tokenInputs?.[1]?.symbol ?? '',

    enabled: tokenInputs?.length > 1,
  });

  const navigate = useNavigate();
  const { id } = useParams();

  useRequirePrarams([!!id], () => navigate(-1));

  const { lpTokenName } = pool;

  const enabled = !!id && totalValue > 0 && allowance1 && (allowance2 || tokenInputs.length < 2);
  const { isLoading, isSuccess, txData, writeAsync, blockTimestamp } = useAddLiquidity({
    id: id as string,
    enabled,
    tokens:
      tokenInputs?.map(t => ({
        address: EVM_TOKEN_ADDRESS?.[currentNetwork]?.[t.symbol] ?? '',
        currency: t?.symbol ?? '',
        amount: parseUnits(t.amount.toString(), TOKEN_DECIMAL[currentNetwork]).toString(),
      })) ?? [],
  });

  const step = useMemo(() => {
    if (isSuccess) {
      return tokenInputs.length + 1;
    }

    if (!allowance1) return 1;
    if (!allowance2 && tokenInputs.length > 1) return 2;
    return tokenInputs.length + 1;
  }, [allowance1, allowance2, isSuccess, tokenInputs.length]);

  const txDate = new Date(blockTimestamp ?? 0);

  const { close } = usePopup(POPUP_ID.ADD_LP);

  // TODO: handle 3 tokens
  const handleButton = async () => {
    if (isSuccess) {
      navigate(-1);
      close();
      return;
    }

    if (step === 1) {
      await allowToken1?.();
      return;
    }
    if (step === 2 && tokenInputs.length > 1) {
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
    window.open(`${SCANNER_URL}/tx/${txData?.transactionHash}`);
  };

  return (
    <Popup
      id={POPUP_ID.ADD_LP}
      icon={
        isSuccess && (
          <IconWrapper>
            <IconCheck />
          </IconWrapper>
        )
      }
      title={isSuccess ? 'Add liquidity confirmed!' : 'Add liquidity preview'}
      button={
        <ButtonWrapper onClick={() => handleButton()}>
          <ButtonPrimaryLarge
            text={
              isLoading
                ? 'Confirming'
                : isSuccess
                ? 'Return to pool page'
                : step === 1
                ? `Approve ${tokenInputs[0]?.symbol} for adding liquidity`
                : step === 2 && tokenInputs.length > 1
                ? `Approve ${tokenInputs[1]?.symbol} for adding liquidity`
                : 'Add liquidity'
            }
            isLoading={isLoading}
            buttonType={isSuccess ? 'outlined' : 'filled'}
          />
        </ButtonWrapper>
      }
    >
      <Wrapper>
        <List title={`You're providing`}>
          {tokenInputs.map(({ symbol, amount }, idx) => (
            <div key={idx}>
              <TokenList
                key={`token-${idx}`}
                type="large"
                title={`${amount}`}
                subTitle={`${symbol}`}
                description={`$${formatNumber(amount * getTokenPrice(symbol), 2)}`}
                image={TOKEN_IMAGE_MAPPER[symbol]}
                leftAlign={true}
              />
              {idx !== tokenInputs.length - 1 && <Divider key={`divider-${idx}`} />}
            </div>
          ))}
        </List>

        <List title={`You're expected to receive`}>
          <TokenList
            type="large"
            title={`${lpTokenAmount}`}
            subTitle={`${lpTokenName}`}
            description={`$${formatNumber(totalValue)}`}
            image={
              <Jazzicon
                diameter={36}
                seed={jsNumberForAddress(
                  EVM_TOKEN_ADDRESS?.[currentNetwork]?.[lpTokenName] || lpTokenName || ''
                )}
              />
            }
            leftAlign={true}
          />
        </List>

        <List title={`Summary`}>
          <Summary>
            <SummaryTextTitle>Total</SummaryTextTitle>
            <SummaryText>{`$${formatNumber(totalValue)}`}</SummaryText>
          </Summary>
          <Summary>
            <SummaryTextTitle>Price impact</SummaryTextTitle>
            <SummaryText>{priceImpact}%</SummaryText>
          </Summary>
        </List>

        <LoadingStep
          totalSteps={tokenInputs.length + 1}
          step={step}
          isLoading={
            step === 1
              ? allowLoading1
              : step === 2 && tokenInputs.length > 1
              ? allowLoading2
              : isLoading
          }
          isDone={isSuccess}
        />

        {isSuccess && (
          <Scanner onClick={() => handleLink()}>
            <IconTime width={20} height={20} fill={COLOR.NEUTRAL[40]} />
            <ScannerText>{txDate.toString()}</ScannerText>
            <IconLink width={20} height={20} fill={COLOR.NEUTRAL[40]} />
          </Scanner>
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

const IconWrapper = tw.div`
  flex-center w-32 h-32 rounded-full bg-green-50
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
