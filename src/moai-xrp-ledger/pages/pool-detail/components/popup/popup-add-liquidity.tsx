import { useEffect, useMemo } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { useNavigate, useParams } from 'react-router-dom';
import tw from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconCheck, IconLink, IconTime } from '~/assets/icons';

import { ButtonPrimaryLarge } from '~/components/buttons/primary';
import { List } from '~/components/lists';
import { LoadingStep } from '~/components/loadings/step';
import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';

import { usePopup } from '~/hooks/components/use-popup';
import { useRequirePrarams } from '~/hooks/utils/use-require-params';
import { formatNumber } from '~/utils/util-number';
import { POPUP_ID } from '~/types/components';

import { useAmmInfo } from '~/moai-xrp-ledger/api/api-contract/amm/get-amm-info';
import { useAddLiquidity } from '~/moai-xrp-ledger/api/api-contract/pool/add-liquiditiy';
import { useTrustLines } from '~/moai-xrp-ledger/api/api-contract/token/trustlines';

import {
  ISSUER,
  SCANNER_URL,
  TOKEN_IMAGE_MAPPER,
  TOKEN_USD_MAPPER,
} from '~/moai-xrp-ledger/constants';

import { PoolInfo } from '~/moai-xrp-ledger/types/components';

import { TOKEN } from '~/moai-xrp-ledger/types/contracts';

interface TokenInputValues {
  name: TOKEN;
  amount: number;
}
interface Props {
  poolInfo: PoolInfo;

  tokenInputValues: TokenInputValues[];

  totalValue: number;
  priceImpact: number;
}

export const AddLiquidityPopup = ({
  poolInfo,
  tokenInputValues,
  totalValue,
  priceImpact,
}: Props) => {
  const { moiPrice } = useAmmInfo(poolInfo.account);

  const {
    allow: allowToken1,
    allowance: allowance1,
    isLoading: allowLoading1,
    isSuccess: allowSuccess1,
    refetchTrustLines,
  } = useTrustLines({
    currency: 'MOI',
    issuer: ISSUER.MOI,
    amount: tokenInputValues[0]?.amount?.toString() ?? '0',
  });

  const navigate = useNavigate();
  const { id: account } = useParams();

  useRequirePrarams([!!account], () => navigate(-1));

  const { tokenName: liquidityTokenName } = poolInfo;

  const tokens = tokenInputValues?.map(token => ({
    currency: token?.name,
    issuer: ISSUER[token?.name ?? ''],
    amount: (token?.amount ?? 0).toString(),
  }));
  const { isLoading, isSuccess, txData, writeAsync, blockTimestamp } = useAddLiquidity({
    account: account as string,
    request: {
      token1: tokens[0],
      token2: tokens[1],
    },
  });

  const step = useMemo(() => {
    if (isSuccess) {
      return tokenInputValues.length + 1;
    }
    if (!allowance1) {
      return 1;
    }
    return tokenInputValues.length + 1;
  }, [allowance1, tokenInputValues.length, isSuccess]);

  const txDate = new Date(blockTimestamp ?? 0);

  // TODO
  const liquidityTokenAmount = Math.sqrt(
    tokenInputValues[0].amount * tokenInputValues[0].amount +
      tokenInputValues[1].amount * tokenInputValues[1].amount
  ).toFixed(2);

  const { close } = usePopup(POPUP_ID.ADD_LP);

  const handleButton = async () => {
    if (isSuccess) {
      close();
    } else {
      if (step === 1) {
        await allowToken1?.();
        return;
      }
      await writeAsync?.();
    }
  };

  useEffect(() => {
    if (allowSuccess1) {
      refetchTrustLines();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowSuccess1]);

  const handleLink = () => {
    window.open(`${SCANNER_URL}/transactions/${txData?.hash}`);
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
                ? `Approve ${tokenInputValues[0]?.name} for adding liquidity`
                : step === 2 && tokenInputValues.length > 1
                ? `Approve ${tokenInputValues[1]?.name} for adding liquidity`
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
          {tokenInputValues.map(({ name, amount }, idx) => {
            const price = name === 'XRP' ? TOKEN_USD_MAPPER.XRP : moiPrice;
            return (
              <div key={idx}>
                <TokenList
                  key={`token-${idx}`}
                  type="large"
                  title={`${amount}`}
                  subTitle={`${name}`}
                  description={`$${formatNumber(amount * price, 2)}`}
                  image={TOKEN_IMAGE_MAPPER[name]}
                  leftAlign={true}
                />
                {idx !== tokenInputValues.length - 1 && <Divider key={`divider-${idx}`} />}
              </div>
            );
          })}
        </List>

        <List title={`You're expected to receive`}>
          <TokenList
            type="large"
            title={`${liquidityTokenAmount}`}
            subTitle={`${liquidityTokenName}`}
            description={`$${formatNumber(totalValue)}`}
            image={<Jazzicon diameter={36} seed={jsNumberForAddress(ISSUER.XRP_MOI ?? '0x0')} />}
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
            <SummaryText>{formatNumber(priceImpact, 2)}%</SummaryText>
          </Summary>
        </List>

        <LoadingStep
          totalSteps={tokenInputValues.length + 1}
          step={step}
          isLoading={step === 1 ? allowLoading1 : isLoading}
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
