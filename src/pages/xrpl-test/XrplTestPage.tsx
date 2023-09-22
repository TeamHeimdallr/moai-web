import { useState } from 'react';

import { useGetAmmInfo } from '~/api/xrpl/get-amm';
import { ButtonPrimaryMedium } from '~/components/buttons/primary';
import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';
import { InputTextField } from '~/components/inputs/textfield';

import {
  ButtonWrapper,
  ContentWrapper,
  GnbWrapper,
  InnerWrapper,
  InputInnerWrapper,
  InputTitle,
  InputWrapper,
  Title,
  Wrapper,
} from '.';

export const XrplTestPage = () => {
  const [xrpValue, setXrpValue] = useState(0);
  const [moaiValue, setMoaiValue] = useState(0);
  const { checkAmmExist, ammInfo } = useGetAmmInfo({
    asset1: {
      currency: 'XRP',
    },
    asset2: {
      currency: 'MOI',
      issuer: 'rPEQacsbfGADDHb6wShzTZ2ajByQFPdY3E',
    },
  });

  const handleCreateLP = async () => {
    const result = await checkAmmExist();
    console.log('result', result);

    if (!result) {
      const ammcreate_result = await client.submitAndWait(
        {
          TransactionType: 'AMMCreate',
          Account: wallet.address,
          Amount: {
            currency: 'TST',
            issuer: 'rP9jPyP5kyvFRb6ZiRghAGw5u8SGAmU4bd',
            value: '15',
          },
          Amount2: {
            currency: foo_amount.currency,
            issuer: foo_amount.issuer,
            value: '100',
          },
          TradingFee: 500,
          Fee: amm_fee_drops,
        },
        { autofill: true, wallet: wallet, fail_hard: true }
      );
      // Use fail_hard so you don't waste the tx cost if you mess up
      if (ammcreate_result.result.meta.TransactionResult == 'tesSUCCESS') {
        console.log(`AMM created: ${EXPLORER}/transactions/${ammcreate_result.result.hash}`);
      } else {
        throw `Error sending transaction: ${ammcreate_result}`;
      }
    }
  };

  return (
    <>
      <Wrapper>
        <GnbWrapper>
          <Gnb />
        </GnbWrapper>
        <InnerWrapper>
          <ContentWrapper>
            <Title>XRPL TEST {ammInfo && ammInfo.result?.toString()} </Title>
            {/*
                Provide LP
             */}
            <ButtonWrapper>
              <InputWrapper>
                <InputInnerWrapper>
                  <InputTitle>XRP</InputTitle>
                  <InputTextField
                    value={xrpValue}
                    onChange={e => setXrpValue(Number(e.target.value))}
                  ></InputTextField>
                </InputInnerWrapper>
                <InputInnerWrapper>
                  <InputTitle>MOAI</InputTitle>
                  <InputTextField
                    value={moaiValue}
                    onChange={e => setMoaiValue(Number(e.target.value))}
                  ></InputTextField>
                </InputInnerWrapper>
              </InputWrapper>
              <ButtonPrimaryMedium
                text="Create LP"
                onClick={() => handleCreateLP()}
              ></ButtonPrimaryMedium>
            </ButtonWrapper>

            {/*
                Swap
            */}
          </ContentWrapper>
        </InnerWrapper>
        <Footer />
      </Wrapper>
    </>
  );
};
