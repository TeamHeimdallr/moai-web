import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { format } from 'date-fns';
import tw, { css, styled } from 'twin.macro';
import * as yup from 'yup';

import { COLOR } from '~/assets/colors';
import { IconArrowDown, IconCheck, IconLink, IconTime, IconTokenXrp } from '~/assets/icons';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { InputNumber } from '~/components/inputs';
import { List } from '~/components/lists';
import { Token } from '~/components/token';
import { TokenList } from '~/components/token-list';

import { TooltipAddress } from '~/pages/campaign/components/tooltip/address';

import { DATE_FORMATTER } from '~/utils';
import { NETWORK, TOOLTIP_ID } from '~/types';

interface InputFormState {
  input: number;
}

const Bridge = () => {
  const [inputValue, setInputValue] = useState<number>();
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const address = '0x25adAF52a870a1EEC5F677E111674439D13fAE300';
  // TODO : add validation
  const validToBridge = inputValue && Number(inputValue) > 0;

  const schema = yup.object().shape({
    input: yup.number().min(0).required(),
  });
  const { control, setValue, formState } = useForm<InputFormState>({
    resolver: yupResolver(schema),
  });

  //TODO : Bridge
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
              <SuccessTitle>Bridge confirmed!</SuccessTitle>
              <SuccessSubTitle>Successfully bridged your $XRP to The Root Network.</SuccessSubTitle>
            </SuccessMessageWrapper>
            <List title="Total">
              <TokenList
                title={`0 XRP`}
                description={`$0`}
                image={<IconTokenXrp width={36} />}
                type="large"
                leftAlign
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
              <ButtonPrimaryLarge text="Continue to add liquidity" />
            </SuccessBottomWrapper>
          </SuccessWrapper>
        </>
      )}
      {!isSuccess && (
        <>
          <Wrapper>
            <InputNumber
              name={'input1'}
              title="From"
              network={NETWORK.XRPL}
              control={control}
              token={<Token token={'XRP'} image />}
              tokenName={'XRPL'}
              tokenValue={0}
              balance={0}
              value={inputValue}
              handleChange={val => setInputValue(val)}
              maxButton
              setValue={setValue}
              formState={formState}
            />
            <IconWrapper>
              <ArrowDownWrapper>
                <IconArrowDown width={20} height={20} fill={COLOR.PRIMARY[50]} />
              </ArrowDownWrapper>
            </IconWrapper>
            <List title="To" network={NETWORK.THE_ROOT_NETWORK}>
              <AccountWrapper>
                <RegularText>Account</RegularText>
                {/* TODO: get truncated address from xrp*/}
                <Account data-tooltip-id={TOOLTIP_ID.ADDRESS}>{address}</Account>
              </AccountWrapper>
            </List>
            <TotalXrpWrapper>
              <TextWrapper>
                <TotalExpectedXrp>Total expected after fee</TotalExpectedXrp>
                <Amount>0 XRP</Amount>
              </TextWrapper>
              <TextWrapper>
                <RegularText>Fee</RegularText>
                <RegularText>~ 1.01 XRP</RegularText>
              </TextWrapper>
            </TotalXrpWrapper>
            <ButtonPrimaryLarge
              text={'Bridge'}
              disabled={!validToBridge}
              onClick={handleButtonClick}
            />
          </Wrapper>
          <TooltipAddress address={address} />
        </>
      )}
    </>
  );
};

const Wrapper = tw.div`
  relative w-full flex flex-col p-24 bg-neutral-10 rounded-12 gap-16
`;
const RegularText = tw.div`
  font-r-14 text-neutral-80
`;
const AccountWrapper = tw.div`
  w-full flex items-center justify-between p-16
`;
const Account = tw.div`
  w-86 font-m-14 text-neutral-100 truncate
`;
const TotalXrpWrapper = tw.div`
  w-full flex flex-col px-20 py-16 gap-12 bg-neutral-15 rounded-8
`;
const TextWrapper = tw.div`
  w-full flex items-center justify-between
`;
const TotalExpectedXrp = tw.div`
  font-r-16 text-neutral-100
`;
const Amount = tw.div`
  font-m-16 text-neutral-100
`;
const IconWrapper = tw.div`
  absolute absolute-center-x top-168 z-1
`;

const ArrowDownWrapper = tw.div`
  p-6 flex-center rounded-full bg-neutral-30
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
export default Bridge;
