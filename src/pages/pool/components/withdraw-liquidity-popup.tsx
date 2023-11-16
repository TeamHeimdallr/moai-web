import { useNavigate } from 'react-router-dom';
import tw from 'twin.macro';
import { parseUnits } from 'viem';

import { useWithdrawLiquidity } from '~/api/api-contract/pool/withdraw-liquidity';

import { COLOR } from '~/assets/colors';
import { IconCheck, IconLink, IconTime } from '~/assets/icons';

import { SCANNER_URL, TOKEN_DECIMAL_WITHDRAW_LP } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { List } from '~/components/lists';
import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { formatNumber, getNetworkAbbr } from '~/utils';
import { IPool, ITokenComposition, NETWORK, POPUP_ID } from '~/types';

interface Props {
  pool?: IPool;
  tokensOut?: (ITokenComposition & { amount: number })[];

  lpTokenPrice: number;
  bptIn: number;
  priceImpact: string;
  withdrawTokenWeight: number;
}

export const WithdrawLiquidityPopup = ({
  pool,
  tokensOut,

  lpTokenPrice,
  bptIn,
  priceImpact,
  withdrawTokenWeight,
}: Props) => {
  const navigate = useNavigate();
  const { isXrp } = useNetwork();
  const { poolId, network, lpToken } = pool || {};
  const networkAbbr = getNetworkAbbr(network);

  const { isLoading, isSuccess, txData, writeAsync, blockTimestamp } = useWithdrawLiquidity({
    id: poolId || '',
    tokens: tokensOut || [],
    // input value
    bptIn: parseUnits(`${bptIn}`, TOKEN_DECIMAL_WITHDRAW_LP[network || NETWORK.XRPL]),
  });

  const txDate = new Date(blockTimestamp ?? 0);
  const totalValue = bptIn * lpTokenPrice;

  const { close } = usePopup(POPUP_ID.WITHDRAW_LP);

  const handleButton = async () => {
    if (isSuccess) {
      navigate(`/pools/${networkAbbr}/${poolId}`);
      close();
    } else {
      await writeAsync?.();
    }
  };

  const handleLink = () => {
    const txHash = isXrp ? txData?.hash : txData?.transactionHash;
    const url = `${SCANNER_URL[network || NETWORK.XRPL]}/${
      isXrp ? 'transactions' : 'tx'
    }/${txHash}`;

    window.open(url);
  };

  return (
    <Popup
      id={POPUP_ID.WITHDRAW_LP}
      title={isSuccess ? '' : 'Withdrawal preview'}
      button={
        <ButtonWrapper onClick={() => handleButton()}>
          <ButtonPrimaryLarge
            text={isLoading ? 'Confirming' : isSuccess ? 'Return to pool page' : 'Withdraw'}
            isLoading={isLoading}
            buttonType={isSuccess ? 'outlined' : 'filled'}
          />
        </ButtonWrapper>
      }
    >
      <Wrapper>
        {isSuccess ? (
          <SuccessWrapper>
            <IconWrapper>
              <IconCheck width={40} height={40} />
            </IconWrapper>
            <SuccessTitle>Withdrawal confirmed!</SuccessTitle>
            <SuccessSubTitle>{`Successfully withdrawned from ${
              lpToken?.symbol || ''
            } Pool`}</SuccessSubTitle>
          </SuccessWrapper>
        ) : (
          <List title={`You're providing`}>
            <TokenList
              type="large"
              title={`${formatNumber(bptIn, 4)} ${lpToken?.symbol}`}
              description={`$${formatNumber(totalValue)} (${withdrawTokenWeight.toFixed(4)}%)`}
              image={lpToken?.image}
              leftAlign
            />
          </List>
        )}

        <List title={`You're expected to receive`}>
          {tokensOut?.map(({ symbol, currentWeight, amount, image, price }, i) => (
            <div key={`${symbol}-${i}`}>
              <TokenList
                type="large"
                title={`${amount.toFixed(6)} ${symbol}`}
                description={`$${formatNumber(amount * (price || 0))} (${(
                  (currentWeight || 0) * 100
                )?.toFixed(2)}%)`}
                image={image}
                leftAlign
              />
              {i !== (tokensOut?.length || 0) - 1 && <Divider />}
            </div>
          ))}
        </List>

        {isSuccess ? (
          <Scanner onClick={() => handleLink()}>
            <IconTime width={20} height={20} fill={COLOR.NEUTRAL[40]} />
            <ScannerText>{txDate.toString()}</ScannerText>
            <IconLink width={20} height={20} fill={COLOR.NEUTRAL[40]} />
          </Scanner>
        ) : (
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
