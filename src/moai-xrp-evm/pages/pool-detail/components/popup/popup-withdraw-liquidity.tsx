import tw from 'twin.macro';
import { parseEther } from 'viem';

import { IconCheck, IconLink, IconTime } from '~/assets/icons';

import { ButtonPrimaryLarge } from '~/components/buttons/primary';
import { List } from '~/components/lists';
import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';

import { usePopup } from '~/hooks/pages/use-popup';
import { formatNumber } from '~/utils/number';
import { POPUP_ID } from '~/types';

import { useWithdrawLiquidity } from '~/moai-xrp-evm/api/api-contract/pool/withdraw-liquiditiy';

import {
  SCANNER_URL,
  TOKEN_DESCRIPTION_MAPPER,
  TOKEN_IMAGE_MAPPER,
} from '~/moai-xrp-evm/constants';
import { TOKEN_ADDRESS } from '~/moai-xrp-evm/constants';

import { PoolInfo } from '~/moai-xrp-evm/types/components';

import { TOKEN } from '~/moai-xrp-evm/types/contracts';

interface Props {
  poolInfo: PoolInfo;

  withdrawInputValue: number;
  liquidityPoolTokenBalance: number;
  tokenValue: number;

  priceImpact: number;
}

export const WithdrawLiquidityPopup = ({
  poolInfo,
  withdrawInputValue,
  liquidityPoolTokenBalance,
  tokenValue,
  priceImpact,
}: Props) => {
  const priceImpactString = priceImpact < 0.01 ? '< 0.01' : formatNumber(priceImpact, 2);
  const { compositions } = poolInfo;

  const { isLoading, isSuccess, txData, writeAsync, blockTimestamp } = useWithdrawLiquidity({
    poolId: poolInfo.id,
    request: {
      tokens: compositions.map(c =>
        c.tokenAddress === TOKEN_ADDRESS['XRP'] ? TOKEN_ADDRESS['ZERO'] : c.tokenAddress
      ),
      amount: parseEther(`${withdrawInputValue}`),
    },
  });

  const txDate = new Date(blockTimestamp ?? 0);

  const totalValue = tokenValue * withdrawInputValue;
  const withdrawRatio = Number(
    Math.round(
      (liquidityPoolTokenBalance ? withdrawInputValue / liquidityPoolTokenBalance : 0) * 10000
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
            subTitle={`${poolInfo.tokenName}`}
            description={`$${formatNumber(totalValue)} (${withdrawRatio}%)`}
            image={TOKEN_IMAGE_MAPPER[poolInfo.tokenName] || TOKEN_IMAGE_MAPPER[TOKEN.MOAI]}
            leftAlign={true}
          />
        </List>

        <List title={`You're expected to receive`}>
          {compositions.map(({ tokenAddress, name, weight }, i) => (
            <div key={`div-${tokenAddress}`}>
              <TokenList
                key={tokenAddress}
                type="large"
                title={`${name} ${weight}%`}
                description={`${TOKEN_DESCRIPTION_MAPPER[name]}`}
                image={TOKEN_IMAGE_MAPPER[name]}
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
            <SummaryText>{priceImpactString}%</SummaryText>
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
