import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { useNavigate, useParams } from 'react-router-dom';
import tw from 'twin.macro';
import { Address, isAddress, parseEther } from 'viem';

import { useAddLiquidity } from '~/api/api-contract/pool/add-liquiditiy';
import { usePoolBalance } from '~/api/api-contract/pool/get-liquidity-pool-balance';
import { IconCheck, IconLink, IconTime } from '~/assets/icons';
import { ButtonPrimaryLarge } from '~/components/buttons/primary';
import { List } from '~/components/lists';
import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';
import {
  POOL_ID,
  SCANNER_URL,
  TOKEN_ADDRESS,
  TOKEN_IMAGE_MAPPER,
  TOKEN_USD_MAPPER,
} from '~/constants';
import { usePopup } from '~/hooks/pages/use-popup';
import { useRequirePrarams } from '~/hooks/pages/use-require-params';
import { POPUP_ID } from '~/types/components';
import { TOKEN } from '~/types/contracts';
import { formatNumber } from '~/utils/number';

interface TokenInfo {
  name: TOKEN;
  amount: number;
}
interface Props {
  tokenList: TokenInfo[];
  totalValue: number;
  priceImpact: number;
}

export const AddLiquidityPopup = ({ tokenList, totalValue, priceImpact }: Props) => {
  const navigate = useNavigate();
  const { id } = useParams();

  useRequirePrarams([!!id, isAddress(id as Address)], () => navigate(-1));

  const { poolInfo } = usePoolBalance(id as Address);
  const { name: lpName } = poolInfo;

  const prepareRequestData = () => {
    return {
      tokens: tokenList.map(t => TOKEN_ADDRESS[t.name]),
      amountsIn: tokenList.map(t => parseEther(t.amount.toString())),
    };
  };

  const { isLoading, isSuccess, txData, writeAsync, blockTimestamp } = useAddLiquidity({
    enabled: !!id && totalValue > 0,
    poolId: id as Address,
    request: prepareRequestData(),
  });

  const txDate = new Date(blockTimestamp ?? 0);

  // TODO
  const lpAmount = (
    tokenList.length > 2
      ? Math.sqrt(
          tokenList[0].amount * tokenList[0].amount +
            tokenList[1].amount * tokenList[1].amount +
            tokenList[2].amount * tokenList[2].amount
        )
      : Math.sqrt(
          tokenList[0].amount * tokenList[0].amount + tokenList[1].amount * tokenList[1].amount
        )
  ).toFixed(2);
  const { close } = usePopup(POPUP_ID.ADD_LP);

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
            text={isLoading ? 'Confirming' : isSuccess ? 'Return to pool page' : 'Add liquidity'}
            isLoading={isLoading}
            buttonType={isSuccess ? 'outlined' : 'filled'}
          />
        </ButtonWrapper>
      }
    >
      <Wrapper>
        <List title={`You're providing`}>
          {tokenList.map(({ name, amount }, idx) => (
            <div key={idx}>
              <TokenList
                key={`token-${idx}`}
                type="large"
                title={`${amount}`}
                subTitle={`${name}`}
                description={`$${formatNumber(amount * TOKEN_USD_MAPPER[name], 2)}`}
                image={TOKEN_IMAGE_MAPPER[name]}
                leftAlign={true}
              />
              {idx !== tokenList.length - 1 && <Divider key={`divider-${idx}`} />}
            </div>
          ))}
        </List>

        <List title={`You're expected to receive`}>
          <TokenList
            type="large"
            title={`${lpAmount}`}
            subTitle={`${lpName}`}
            description={`$${formatNumber(totalValue)}`}
            image={
              <Jazzicon
                diameter={36}
                seed={jsNumberForAddress(
                  (id === POOL_ID.POOL_A ? TOKEN_ADDRESS.POOL_A : TOKEN_ADDRESS.POOL_B) ?? '0x'
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