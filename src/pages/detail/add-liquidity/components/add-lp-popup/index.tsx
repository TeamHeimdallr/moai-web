import { useState } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import tw from 'twin.macro';

import { IconCheck, IconLink, IconTime } from '~/assets/icons';
import { ButtonPrimaryLarge } from '~/components/buttons/primary';
import { List } from '~/components/lists';
import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';
import { TESTNET_SCANNER_URL, TOKEN_IMAGE_MAPPER, TOKEN_USD_MAPPER } from '~/constants';
import { usePopup } from '~/hooks/pages/use-popup';
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
  lpName: string;
  priceImpact: number;
}

export const AddLpPopup = ({ tokenList, totalValue, lpName, priceImpact }: Props) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const lpAmount = 124.52; // TODO
  const lpAddress = '0x1234'; // TODO
  const { close } = usePopup(POPUP_ID.ADD_LP);

  const handleButton = async () => {
    // TODO
    if (isSuccess) close();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSuccess(true);
    setIsLoading(false);
  };

  const handleLink = (txHash: string) => {
    window.open(`${TESTNET_SCANNER_URL}/tx/${txHash}`);
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
            <>
              <TokenList
                key={name}
                type="large"
                title={`${amount}`}
                subTitle={`${name}`}
                description={`$${formatNumber(amount * TOKEN_USD_MAPPER[name], 2)}`}
                image={TOKEN_IMAGE_MAPPER[name]}
                leftAlign={true}
              />
              {idx !== tokenList.length - 1 && <Divider />}
            </>
          ))}
        </List>

        <List title={`You're expected to receive`}>
          <TokenList
            type="large"
            title={`${lpAmount}`}
            subTitle={`${lpName}`}
            description={`$${formatNumber(totalValue)}`}
            image={<Jazzicon diameter={36} seed={jsNumberForAddress(lpAddress ?? '0x')} />}
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
          <Scanner onClick={() => handleLink('')}>
            <IconTime width={20} height={20} fill="#6D728C" />
            <ScannerText>Sun, Aug 27, 2023, 02:18:32 PM GMT+9</ScannerText>
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
