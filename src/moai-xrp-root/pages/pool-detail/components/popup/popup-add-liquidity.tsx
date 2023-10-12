import { useEffect, useMemo } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { useNavigate, useParams } from 'react-router-dom';
import tw from 'twin.macro';
import { Address, isAddress, parseUnits } from 'viem';

import { COLOR } from '~/assets/colors';
import { IconCheck, IconLink, IconTime } from '~/assets/icons';

import { ButtonPrimaryLarge } from '~/components/buttons/primary';
import { List } from '~/components/lists';
import { Popup } from '~/components/popup';
import { Stepper } from '~/components/stepper';
import { TokenList } from '~/components/token-list';

import { usePopup } from '~/hooks/pages/use-popup';
import { useRequirePrarams } from '~/hooks/pages/use-require-params';
import { formatNumber } from '~/utils/number';
import { POPUP_ID } from '~/types/components';

import { useAddLiquidity } from '~/moai-xrp-root/api/api-contract/pool/add-liquiditiy';
import { useLiquidityPoolTokenAmount } from '~/moai-xrp-root/api/api-contract/pool/get-liquidity-pool-balance';
import { useTokenApprove } from '~/moai-xrp-root/api/api-contract/token/approve';

import {
  CONTRACT_ADDRESS,
  SCANNER_URL,
  TOKEN_ADDRESS,
  TOKEN_DECIAML,
  TOKEN_IMAGE_MAPPER,
} from '~/moai-xrp-root/constants';

import { PoolInfo } from '~/moai-xrp-root/types/components';

import { useGetRootNetworkTokenPrice } from '~/moai-xrp-root/hooks/data/use-root-network-token-price';
import { TOKEN } from '~/moai-xrp-root/types/contracts';

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
  const { getTokenPrice } = useGetRootNetworkTokenPrice();

  const {
    allow: allowToken1,
    allowance: allowance1,
    isLoading: allowLoading1,
    isSuccess: allowSuccess1,
    refetch: refetchAllowance1,
  } = useTokenApprove({
    enabled: tokenInputValues?.length > 0,
    amount: tokenInputValues[0]?.amount ?? 0,
    allowanceMin: tokenInputValues[0]?.amount ?? 0,
    spender: CONTRACT_ADDRESS.VAULT,
    tokenAddress: TOKEN_ADDRESS[tokenInputValues[0]?.name],
  });

  const {
    allow: allowToken2,
    allowance: allowance2,
    isLoading: allowLoading2,
    isSuccess: allowSuccess2,
    refetch: refetchAllowance2,
  } = useTokenApprove({
    enabled: tokenInputValues.length > 1,
    amount: tokenInputValues[1]?.amount ?? 0,
    allowanceMin: tokenInputValues[1]?.amount ?? 0,
    spender: CONTRACT_ADDRESS.VAULT,
    tokenAddress: TOKEN_ADDRESS[tokenInputValues[1]?.name],
  });

  const navigate = useNavigate();
  const { id: poolId } = useParams();

  const { bptOut: liquidityTokenAmount } = useLiquidityPoolTokenAmount({
    poolId: poolId as Address,
    amountsIn: tokenInputValues.map(v => v.amount),
  });

  useRequirePrarams([!!poolId, isAddress(poolId as Address)], () => navigate(-1));

  const { tokenName: liquidityTokenName } = poolInfo;

  const prepareRequestData = () => {
    return {
      tokens: tokenInputValues.map(t => TOKEN_ADDRESS[t.name]),
      amountsIn: tokenInputValues.map(t => parseUnits(t.amount.toString(), TOKEN_DECIAML)),
    };
  };

  const { isLoading, isSuccess, txData, writeAsync, blockTimestamp } = useAddLiquidity({
    enabled:
      !!poolId && totalValue > 0 && allowance1 && (allowance2 || tokenInputValues.length < 2),
    poolId: poolId as Address,
    request: prepareRequestData(),
  });

  const step = useMemo(() => {
    if (isSuccess) {
      return tokenInputValues.length + 1;
    }

    if (!allowance1) {
      return 1;
    }
    if (!allowance2 && tokenInputValues.length > 1) {
      return 2;
    }
    return tokenInputValues.length + 1;
  }, [allowance1, allowance2, tokenInputValues.length, isSuccess]);

  const txDate = new Date(blockTimestamp ?? 0);

  const { close } = usePopup(POPUP_ID.ADD_LP);

  const handleButton = async () => {
    if (isSuccess) {
      close();
    } else {
      if (step === 1) {
        await allowToken1?.();
        return;
      }
      if (step === 2 && tokenInputValues.length > 1) {
        await allowToken2?.();
        return;
      }
      await writeAsync?.();
    }
  };

  useEffect(() => {
    if (allowSuccess1) {
      refetchAllowance1();
    }
    if (allowSuccess2) {
      refetchAllowance2();
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
          {tokenInputValues.map(({ name, amount }, idx) => (
            <div key={idx}>
              <TokenList
                key={`token-${idx}`}
                type="large"
                title={`${amount}`}
                subTitle={`${name}`}
                description={`$${formatNumber(amount * getTokenPrice(name), 2)}`}
                image={TOKEN_IMAGE_MAPPER[name]}
                leftAlign={true}
              />
              {idx !== tokenInputValues.length - 1 && <Divider key={`divider-${idx}`} />}
            </div>
          ))}
        </List>

        <List title={`You're expected to receive`}>
          <TokenList
            type="large"
            title={`${liquidityTokenAmount}`}
            subTitle={`${liquidityTokenName}`}
            description={`$${formatNumber(totalValue)}`}
            image={
              <Jazzicon diameter={36} seed={jsNumberForAddress(TOKEN_ADDRESS.ROOT_XRP ?? '0x0')} />
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
          totalSteps={tokenInputValues.length + 1}
          step={step}
          isLoading={
            step === 1
              ? allowLoading1
              : step === 2 && tokenInputValues.length > 1
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
