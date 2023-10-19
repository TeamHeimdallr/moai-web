import { useNavigate, useParams } from 'react-router-dom';
import tw from 'twin.macro';
import { parseUnits } from 'viem';

import { useWithdrawLiquidity } from '~/api/api-contract/pool/withdraw-liquidity';

import { COLOR } from '~/assets/colors';
import { IconCheck, IconLink, IconTime } from '~/assets/icons';

import {
  SCANNER_URL,
  TOKEN_DECIMAL_WITHDRAW,
  TOKEN_DESCRIPTION_MAPPER,
  TOKEN_IMAGE_MAPPER,
} from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { List } from '~/components/lists';
import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { formatNumber, getNetworkFull } from '~/utils';
import { IPool, POPUP_ID } from '~/types';

interface Props {
  pool: IPool;

  inputValue: number;
  lpTokenBalance: number;
  tokenValue: number;

  priceImpact: string;

  amountsOut: number[];
}

export const WithdrawLiquidityPopup = ({
  pool,
  inputValue,
  lpTokenBalance,
  tokenValue,
  priceImpact,
  amountsOut,
}: Props) => {
  const navigate = useNavigate();
  const { compositions } = pool;
  const { network } = useParams();
  const { selectedNetwork } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const { isLoading, isSuccess, txData, writeAsync, blockTimestamp } = useWithdrawLiquidity({
    id: pool.id,
    tokens: compositions.map(c => ({
      address: c.address ?? '',
      currency: c.symbol,
      amount: '0',
    })),
    amount: parseUnits(`${inputValue}`, TOKEN_DECIMAL_WITHDRAW[currentNetwork]),
  });

  const txDate = new Date(blockTimestamp ?? 0);

  const totalValue = tokenValue * inputValue;
  const withdrawRatio = Number(
    Math.round((lpTokenBalance ? inputValue / lpTokenBalance : 0) * 10000) / 10000
  );

  const { close } = usePopup(POPUP_ID.WITHDRAW_LP);

  const handleButton = async () => {
    if (isSuccess) {
      navigate(-1);
      close();
    } else {
      await writeAsync?.();
    }
  };

  const handleLink = () => {
    window.open(`${SCANNER_URL}/tx/${txData?.transactionHash}`);
  };

  return (
    <Popup
      id={POPUP_ID.WITHDRAW_LP}
      icon={
        isSuccess && (
          <IconWrapper>
            <IconCheck />
          </IconWrapper>
        )
      }
      title={isSuccess ? 'Withdrawal confirmed!' : 'Withdrawal preview'}
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
        <List title={`You're providing`}>
          <TokenList
            type="large"
            title={`${formatNumber(lpTokenBalance, 2)}`}
            subTitle={`${pool.lpTokenName}`}
            description={`$${formatNumber(totalValue)} (${withdrawRatio}%)`}
            image={TOKEN_IMAGE_MAPPER?.[pool.lpTokenName] || TOKEN_IMAGE_MAPPER.MOAI}
            leftAlign={true}
          />
        </List>

        <List title={`You're expected to receive`}>
          {compositions.map(({ address, symbol, weight }, i) => (
            <div key={`${address || symbol}-${i}`}>
              <TokenList
                type="large"
                title={`${symbol} ${amountsOut?.[i]?.toFixed(4)} (${weight}%)`}
                description={`${TOKEN_DESCRIPTION_MAPPER[symbol]}`}
                image={TOKEN_IMAGE_MAPPER[symbol]}
                leftAlign={true}
              />
              {i !== compositions.length - 1 && <Divider />}
            </div>
          ))}
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
