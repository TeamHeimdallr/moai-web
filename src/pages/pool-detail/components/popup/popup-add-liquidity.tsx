import { useMemo } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { useNavigate, useParams } from 'react-router-dom';
import tw from 'twin.macro';
import { Address, isAddress, parseUnits } from 'viem';

import { useAddLiquidity } from '~/api/api-contract/pool/add-liquiditiy';
import { usePoolBalance } from '~/api/api-contract/pool/get-liquidity-pool-balance';
import { useTokenApprove } from '~/api/api-contract/token/approve';
import { IconCheck, IconLink, IconTime } from '~/assets/icons';
import { ButtonPrimaryLarge } from '~/components/buttons/primary';
import { List } from '~/components/lists';
import { Popup } from '~/components/popup';
import { Stepper } from '~/components/stepper';
import { TokenList } from '~/components/token-list';
import {
  CHAIN,
  CONTRACT_ADDRESS,
  POOL_ID,
  SCANNER_URL,
  TOKEN_ADDRESS,
  TOKEN_IMAGE_MAPPER,
  TOKEN_USD_MAPPER,
} from '~/constants';
import { useGetRootPrice } from '~/hooks/data/use-root-price';
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
  const isRoot = CHAIN === 'root';
  const decimals = isRoot ? 6 : 18;
  const rootPrice = useGetRootPrice();

  const {
    allow: allowToken1,
    allowance: allowance1,
    isLoading: allowLoading1,
  } = useTokenApprove({
    enabled: tokenList.length > 0,
    amount: tokenList[0].amount,
    allowanceMin: tokenList[0].amount,
    spender: CONTRACT_ADDRESS.VAULT,
    tokenAddress: TOKEN_ADDRESS[tokenList[0].name],
  });

  const {
    allow: allowToken2,
    allowance: allowance2,
    isLoading: allowLoading2,
  } = useTokenApprove({
    enabled: tokenList.length > 1,
    amount: tokenList[1]?.amount,
    allowanceMin: tokenList[1]?.amount,
    spender: CONTRACT_ADDRESS.VAULT,
    tokenAddress: TOKEN_ADDRESS[tokenList[1]?.name],
  });

  const {
    allow: allowToken3,
    allowance: allowance3,
    isLoading: allowLoading3,
  } = useTokenApprove({
    enabled: tokenList.length > 2,
    amount: tokenList[2]?.amount,
    allowanceMin: tokenList[2]?.amount,
    spender: CONTRACT_ADDRESS.VAULT,
    tokenAddress: TOKEN_ADDRESS[tokenList[2]?.name],
  });

  const step = useMemo(() => {
    if (!allowance1) {
      return 1;
    } else if (!allowance2 && tokenList.length > 1) {
      return 2;
    } else if (!allowance3 && tokenList.length > 2) {
      return 3;
    } else {
      return tokenList.length + 1;
    }
  }, [allowance1, allowance2, allowance3, tokenList.length]);

  const navigate = useNavigate();
  const { id } = useParams();

  useRequirePrarams([!!id, isAddress(id as Address)], () => navigate(-1));

  const { poolInfo } = usePoolBalance(id as Address);
  const { name: lpName } = poolInfo;

  const prepareRequestData = () => {
    return {
      tokens: tokenList.map(t => TOKEN_ADDRESS[t.name]),
      amountsIn: tokenList.map(t => parseUnits(t.amount.toString(), decimals)),
    };
  };

  const { isLoading, isSuccess, txData, writeAsync, blockTimestamp } = useAddLiquidity({
    enabled:
      !!id &&
      totalValue > 0 &&
      allowance1 &&
      (allowance2 || tokenList.length < 2) &&
      (allowance3 || tokenList.length < 3),
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
      if (step === 1) {
        await allowToken1?.();
      } else if (step === 2 && tokenList.length > 1) {
        await allowToken2?.();
      } else if (step === 3 && tokenList.length > 2) {
        await allowToken3?.();
      } else {
        await writeAsync?.();
      }
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
            text={
              isLoading
                ? 'Confirming'
                : isSuccess
                ? 'Return to pool page'
                : step === 1
                ? `Approve ${tokenList[0]?.name} for adding liquidity`
                : step === 2 && tokenList.length > 1
                ? `Approve ${tokenList[1]?.name} for adding liquidity`
                : step === 3 && tokenList.length > 2
                ? `Approve ${tokenList[2]?.name} for adding liquidity`
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
          {tokenList.map(({ name, amount }, idx) => (
            <div key={idx}>
              <TokenList
                key={`token-${idx}`}
                type="large"
                title={`${amount}`}
                subTitle={`${name}`}
                description={`$${formatNumber(
                  amount * (name == 'ROOT' ? rootPrice : TOKEN_USD_MAPPER[name]),
                  2
                )}`}
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

        <Stepper
          totalSteps={tokenList.length + 1}
          step={step}
          isLoading={
            step === 1
              ? allowLoading1
              : step === 2
              ? allowLoading2
              : step === 3
              ? allowLoading3
              : isLoading
          }
        />

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
