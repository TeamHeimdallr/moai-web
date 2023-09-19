import tw from 'twin.macro';
import { parseEther } from 'viem';

import { useWithdrawLiquidity } from '~/api/api-contract/pool/withdraw-liquiditiy';
import { IconCheck, IconLink, IconTime } from '~/assets/icons';
import { ButtonPrimaryLarge } from '~/components/buttons/primary';
import { List } from '~/components/lists';
import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';
import { SCANNER_URL, TOKEN_DESCRIPTION_MAPPER, TOKEN_IMAGE_MAPPER } from '~/constants';
import { usePopup } from '~/hooks/pages/use-popup';
import { Composition, PoolInfo, POPUP_ID } from '~/types/components';
import { TOKEN } from '~/types/contracts';
import { formatNumber } from '~/utils/number';

interface Props {
  poolInfo: PoolInfo;
  compositions: Composition[];
  withdrawAmount: number;
  liquidityPoolTokenBalance: number;
  tokenUSD: number;
  priceImpact: number;
}

export const WithdrawLiquidityPopup = ({
  poolInfo,
  compositions,
  withdrawAmount,
  liquidityPoolTokenBalance,
  tokenUSD,
  priceImpact,
}: Props) => {
  // const { id } = useParams();

  const { isLoading, isSuccess, txData, writeAsync, blockTimestamp } = useWithdrawLiquidity({
    poolId: poolInfo.id,
    tokens: compositions.map(c => c.tokenAddress),
    amount: parseEther(`${withdrawAmount}`),
  });

  const txDate = new Date(blockTimestamp ?? 0);

  const totalValue = tokenUSD * withdrawAmount;
  const withdrawRatio = Number(
    Math.round(
      (liquidityPoolTokenBalance ? withdrawAmount / liquidityPoolTokenBalance : 0) * 10000
    ) / 10000
  );

  const { close } = usePopup(POPUP_ID.WITHDRAW_LP);

  const handleButton = async () => {
    if (isSuccess) {
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
            title={`${formatNumber(liquidityPoolTokenBalance, 2)}`}
            subTitle={`${poolInfo.name}`}
            description={`$${formatNumber(totalValue)} (${withdrawRatio}%)`}
            image={TOKEN_IMAGE_MAPPER[poolInfo.name] || TOKEN_IMAGE_MAPPER[TOKEN.MOAI]}
            leftAlign={true}
          />
        </List>

        <List title={`You're expected to receive`}>
          {compositions.map(({ tokenAddress, name, weight }, i) => (
            <>
              <TokenList
                key={tokenAddress}
                type="large"
                title={`${name} ${weight}%`}
                description={`${TOKEN_DESCRIPTION_MAPPER[name]}`}
                image={TOKEN_IMAGE_MAPPER[name]}
                leftAlign={true}
              />
              {i !== compositions.length - 1 && <Divider />}
            </>
          ))}
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

        {isSuccess && (
          <Scanner onClick={() => handleLink()}>
            <IconTime width={20} height={20} fill="#6D728C" />
            <ScannerText>{txDate.toString()}</ScannerText>
            <IconLink width={20} height={20} fill="#6D728C" />
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