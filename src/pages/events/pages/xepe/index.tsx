import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import tw, { css, styled } from 'twin.macro';
import { isValidAddress, isValidClassicAddress } from 'xrpl';
import * as yup from 'yup';

import { useCheckXepeEligibilityMutate } from '~/api/api-server/events/check-xepe-eligibility';

import { IconCheck } from '~/assets/icons';

import { ButtonPrimaryLarge, ButtonPrimaryMedium } from '~/components/buttons';
import { Footer } from '~/components/footer';
import { InputText } from '~/components/inputs';

import { useGAPage } from '~/hooks/analaystics/ga-page';

import { Gnb } from './components/gnb';

interface InputFormState {
  input: string;
}

export const XepePage = () => {
  useGAPage();

  const schema = yup.object().shape({
    input: yup.string().min(33, 'Invalid address').max(34, 'Invalid address').required(),
  });

  const { setValue, setError, clearErrors, formState, watch } = useForm<InputFormState>({
    resolver: yupResolver(schema),
  });
  const value = watch('input');

  const { mutateAsync, reset, data, error: serverError } = useCheckXepeEligibilityMutate();

  const errorMessage = formState.errors.input?.message || '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serverErrorMessage = (serverError?.response?.data as any)?.message || serverError?.message;

  const handleCheck = async () => {
    if (isValidAddress(value) || isValidClassicAddress(value)) {
      await mutateAsync({ account: value });
      return;
    }

    setError('input', { message: 'Invalid address' });
  };

  useEffect(() => {
    if (!value || isValidAddress(value) || isValidClassicAddress(value)) {
      clearErrors('input');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (serverError && serverErrorMessage) {
      setError('input', { message: serverErrorMessage });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverError, serverErrorMessage]);

  const isEligible = data?.eligible;

  return (
    <Wrapper>
      <Gnb />
      <InnerWrapper>
        <ContentWrapper>
          <Title>Moai Finance X $XEPE Airdrop</Title>
          <EligibleWrapper>
            <SubTitle>Check your eligibility to claim $XEPE</SubTitle>
            <InputText
              label="XRPL Address"
              placeholder="Enter your address"
              onChange={e => setValue('input', e.target.value)}
              error={!!errorMessage || !!serverErrorMessage}
              errorMessage={errorMessage || serverErrorMessage}
              disabled={!!data}
            />
            {!data && <ButtonPrimaryLarge text="Check" onClick={handleCheck} />}

            {!data ? (
              <ConditionWrapper>
                <ConditionTitle>Conditions</ConditionTitle>
                <ConditionInnerWrapper>
                  <Condition>
                    <Icon>
                      <IconCheck />
                    </Icon>
                    Users who tested AMM on XRPL Devnet.
                  </Condition>
                  <Condition>
                    <Icon>
                      <IconCheck />
                    </Icon>
                    {'Users who participated "Voyage to the Future" campaign, using the bridge.'}
                  </Condition>
                </ConditionInnerWrapper>
              </ConditionWrapper>
            ) : (
              <ResultWrapper>
                <ResultTitleWrapper>
                  {isEligible ? 'You’re eligible for $XEPE!' : 'You aren’t eligible for $XEPE!'}
                  <ResultSubTitle>
                    {isEligible
                      ? 'You need to add trusline to receive $XEPE.'
                      : 'You aren’t eligible for any $XEPE in this round.'}
                  </ResultSubTitle>
                </ResultTitleWrapper>
                <ButtonWrapper>
                  <ButtonPrimaryMedium
                    text={isEligible ? 'Add trustline' : 'Try another wallet'}
                    buttonType={isEligible ? 'filled' : 'outlined'}
                    onClick={() => {
                      if (isEligible) {
                        window.open(
                          'https://xrpl.services/?issuer=r4EQ7VjP1J1AtyuwHTz3xWteJAbDa7UL32&currency=5845504500000000000000000000000000000000&limit=589000000000'
                        );
                        return;
                      }
                      reset();
                    }}
                  />
                </ButtonWrapper>
              </ResultWrapper>
            )}
          </EligibleWrapper>
        </ContentWrapper>
      </InnerWrapper>
      <Footer />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  relative flex flex-col justify-between w-full h-full
`;

const InnerWrapper = tw.div`  
  flex flex-col gap-40 pb-120
`;

const ContentWrapper = styled.div(() => [
  tw`flex flex-col items-center gap-40`,
  css`
    & > div {
      width: 100%;
      max-width: 455px;
    }
  `,
]);

const Title = tw.div`
  flex-center text-neutral-100 font-b-24
`;

const SubTitle = tw.div`
  font-b-16 text-neutral-100
`;

const EligibleWrapper = tw.div`
   w-full flex flex-col flex-shrink-0 rounded-12 bg-neutral-10 
   w-455 p-24 gap-24 pt-20
`;

const ConditionWrapper = tw.div`
  p-16 rounded-8 border-1 border-solid border-neutral-20 bg-neutral-10
  flex flex-col gap-12
`;

const ConditionTitle = tw.div`
  font-r-14 text-primary-60
`;
const ConditionInnerWrapper = tw.div`
  flex flex-col gap-8
`;

const Condition = tw.div`
  flex gap-8 font-r-14 text-neutral-80
`;
const Icon = tw.div`
  flex-center w-16 h-22
`;

const ResultWrapper = tw.div`
  p-16 py-48 rounded-8 border-1 border-solid border-neutral-20 bg-neutral-10
  flex flex-col gap-24 items-center
`;

const ResultTitleWrapper = tw.div`
  flex flex-col gap-12 flex-center font-b-20 text-neutral-100
`;
const ResultSubTitle = tw.div`
  font-r-16 text-neutral-80
`;

const ButtonWrapper = tw.div`
  flex-center w-fit
`;

export default XepePage;
