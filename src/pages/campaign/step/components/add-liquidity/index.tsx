import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { format } from 'date-fns';
import tw, { css, styled } from 'twin.macro';
import * as yup from 'yup';

import { COLOR } from '~/assets/colors';
import {
  IconCheck,
  IconLink,
  IconTime,
  IconTokenMoai,
  IconTokenRoot,
  IconTokenXrp,
} from '~/assets/icons';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { InputNumber } from '~/components/inputs';
import { List } from '~/components/lists';
import { Token } from '~/components/token';
import { TokenList } from '~/components/token-list';

import { DATE_FORMATTER } from '~/utils';
interface InputFormState {
  input: number;
}

export const AddLiquidity = () => {
  const [inputValue, setInputValue] = useState<number>();
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // TODO : add validation
  const validToBridge = inputValue && Number(inputValue) > 0;

  const schema = yup.object().shape({
    input: yup.number().min(0).required(),
  });
  const { control, setValue, formState } = useForm<InputFormState>({
    resolver: yupResolver(schema),
  });

  const handleButtonClick = () => {
    setIsSuccess(true);
  };

  const handleLink = () => {
    console.log('link clicked');
  };
  return (
    <>
      {isSuccess && (
        <>
          <SuccessWrapper>
            <SuccessMessageWrapper>
              <SuccessIconWrapper>
                <IconCheck width={40} height={40} />
              </SuccessIconWrapper>
              <SuccessTitle>Add liquidity confirmed!</SuccessTitle>
              <SuccessSubTitle>Successfully added liquidity to liquidity voyage.</SuccessSubTitle>
            </SuccessMessageWrapper>
            <List title="Expected APY (10%)">
              <TokenList
                title="Pre-mining $MOAI APY (3%)"
                image={<IconTokenMoai width={36} height={36} />}
                type="campaign"
                balance="99,999 MOAI"
                value="$100"
              />
              <Divider />
              <TokenList
                title="$ROOT reward (7%)"
                image={<IconTokenXrp width={36} height={36} />}
                type="campaign"
                balance="99,999 MOAI"
                value="$100"
              />
            </List>
            <SuccessBottomWrapper>
              <TimeWrapper>
                <IconTime />
                {format(new Date(), DATE_FORMATTER.FULL)}
                <ClickableIcon onClick={handleLink}>
                  <IconLink />
                </ClickableIcon>
              </TimeWrapper>
              <ButtonPrimaryLarge text="Return to voyage page" buttonType="outlined" />
            </SuccessBottomWrapper>
          </SuccessWrapper>
        </>
      )}
      {!isSuccess && (
        <Wrapper>
          <InputNumber
            name={'input1'}
            title="You're providing"
            control={control}
            token={<Token token={'XRP'} image imageUrl="/src/assets/icons/icon-token-xrp.svg" />}
            tokenName={'XRPL'}
            tokenValue={0}
            balance={0}
            value={inputValue}
            handleChange={val => setInputValue(val)}
            maxButton
            setValue={setValue}
            formState={formState}
          />
          <List title={`You're providing`}>
            <TokenList
              type="campaign"
              title="Pre-mining $MOAI APY (3%)"
              image={<IconTokenMoai width={36} height={36} />}
              balance="99,999 Moai"
              value="$100"
            />
            <Divider />
            <TokenList
              type="campaign"
              title="$ROOT reward (7%)"
              image={<IconTokenRoot width={36} height={36} />}
              balance="99,999 Root"
              value="$100"
            />
          </List>
          <ButtonPrimaryLarge
            text={'Add Liquidity'}
            disabled={!validToBridge}
            onClick={handleButtonClick}
          />
        </Wrapper>
      )}
    </>
  );
};

const Wrapper = tw.div`
  relative w-full flex flex-col p-24 bg-neutral-10 rounded-12 gap-24
`;

const Divider = tw.div`
  w-full h-1 flex-shrink-0 bg-neutral-20
`;

const SuccessTitle = tw.div`
  text-neutral-100 font-b-20
  md:font-b-24
`;

const SuccessSubTitle = tw.div`
  text-center text-neutral-80 font-r-14
  md:font-r-16
`;

const SuccessWrapper = tw.div`
  flex flex-col bg-neutral-10 pt-40 p-24 gap-40 rounded-12
`;
const SuccessMessageWrapper = tw.div`
  flex-center flex-col gap-12 
`;
const SuccessBottomWrapper = tw.div`
  flex flex-col gap-16
`;
const SuccessIconWrapper = tw.div`
  flex-center w-48 h-48 rounded-full bg-green-50
`;
const TimeWrapper = styled.div(() => [
  tw`flex items-center gap-4 text-neutral-60`,
  css`
    & svg {
      width: 20px;
      height: 20px;
      fill: ${COLOR.NEUTRAL[60]};
    }
  `,
]);

const ClickableIcon = styled.div(() => [
  tw` clickable flex-center`,
  css`
    &:hover svg {
      fill: ${COLOR.NEUTRAL[80]};
    }
  `,
]);
