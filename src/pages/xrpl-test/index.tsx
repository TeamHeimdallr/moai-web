import { useState } from 'react';
import tw, { css, styled } from 'twin.macro';

import { useGetAmmInfo } from '~/api/xrpl/get-amm';
import { ButtonPrimaryMedium } from '~/components/buttons/primary';
import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';
import { InputTextField } from '~/components/inputs/textfield';

const XrplTestPage = () => {
  const [xrpValue, setXrpValue] = useState(0);
  const [rootValue, setRootValue] = useState(0);
  const { checkAmmExist } = useGetAmmInfo({
    asset1: {
      currency: 'XRP',
    },
    asset2: {
      currency: 'MOI',
      issuer: 'rPEQacsbfGADDHb6wShzTZ2ajByQFPdY3E',
    },
  });

  const handleProvideLP = async () => {
    const result = await checkAmmExist();
    console.log('result', result);
  };

  return (
    <>
      <Wrapper>
        <GnbWrapper>
          <Gnb />
        </GnbWrapper>
        <InnerWrapper>
          <ContentWrapper>
            <Title>XRPL TEST</Title>
            {/*
                Provide LP
             */}
            <ButtonWrapper>
              <InputWrapper>
                <InputInnerWrapper>
                  <InputTitle>XRPL</InputTitle>
                  <InputTextField
                    value={xrpValue}
                    onChange={e => setXrpValue(Number(e.target.value))}
                  ></InputTextField>
                </InputInnerWrapper>
                <InputInnerWrapper>
                  <InputTitle>ROOT</InputTitle>
                  <InputTextField
                    value={rootValue}
                    onChange={e => setRootValue(Number(e.target.value))}
                  ></InputTextField>
                </InputInnerWrapper>
              </InputWrapper>
              <ButtonPrimaryMedium
                text="Provide LP"
                onClick={() => handleProvideLP()}
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

const Wrapper = tw.div`
  relative flex flex-col justify-between w-full h-full
`;

const GnbWrapper = tw.div`
  w-full h-80 flex-center
`;

const InnerWrapper = tw.div`
  flex flex-col gap-40 pt-40 pb-120
`;

const ContentWrapper = styled.div(() => [
  tw`flex flex-col items-center gap-40`,
  css`
    & > div {
      width: 100%;
      max-width: 786px;
    }
  `,
]);

const Title = tw.div`
  font-b-24 h-40 flex items-center text-neutral-100
`;

const InputInnerWrapper = tw.div`
`;

const InputTitle = tw.div`
  font-r-16 text-neutral-100
`;

const InputWrapper = tw.div`
  flex gap-10
`;

const ButtonWrapper = tw.div`
  flex flex-col gap-10 items-start
`;

export default XrplTestPage;
