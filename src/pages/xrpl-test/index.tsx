import { getAddress, isInstalled, submitTransaction } from '@gemwallet/api';
import { useState } from 'react';
import tw, { css, styled } from 'twin.macro';

import { useGetAmmInfo } from '~/api/xrpl/get-amm';
import { ButtonPrimaryMedium } from '~/components/buttons/primary';
import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';
import { InputTextField } from '~/components/inputs/textfield';

const XrplTestPage = () => {
  const [xrpValue, setXrpValue] = useState(0);
  const [moaiValue, setMoaiValue] = useState(0);

  const [xrpAddValue, setXrpAddValue] = useState(0);
  const [moaiAddValue, setMoaiAddValue] = useState(0);

  const [xrpFromValue, setXrpFromValue] = useState(0);
  const [moaiFromValue, setMoaiFromValue] = useState(0);

  const [xrpToValue, setXrpToValue] = useState(0);
  const [moaiToValue, setMoaiToValue] = useState(0);

  const { checkAmmExist, ammInfo, getFee } = useGetAmmInfo({
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
    const fee = await getFee();
    console.log('result', result, ammInfo);

    if (!result) {
      isInstalled().then(response => {
        if (response.result.isInstalled) {
          getAddress().then(response => {
            const address = response.result?.address;
            console.log('address', address);

            const transaction = {
              TransactionType: 'AMMCreate',
              Account: address,
              Amount: ((xrpValue ?? 0) * 1e6).toString(),
              Amount2: {
                currency: 'MOI',
                issuer: 'rPEQacsbfGADDHb6wShzTZ2ajByQFPdY3E',
                value: (moaiValue ?? 0).toString(),
              },
              TradingFee: 500, // 0.5%
              Fee: fee,
            };
            submitTransaction({ transaction }) // ignore warning
              .then(response => {
                console.log('Transaction hash: ', response.result?.hash);
              })
              .catch(error => {
                console.error('Transaction submission failed', error);
              });
          });
        }
      });
    }
  };

  const handleProvideLP = async () => {
    const result = await checkAmmExist();

    if (result) {
      isInstalled().then(response => {
        if (response.result.isInstalled) {
          getAddress().then(response => {
            const address = response.result?.address;
            console.log('address', address);

            const transaction = {
              TransactionType: 'AMMDeposit',
              Account: address,
              Amount: ((xrpAddValue ?? 0) * 1e6).toString(),
              Amount2: {
                currency: 'MOI',
                issuer: 'rPEQacsbfGADDHb6wShzTZ2ajByQFPdY3E',
                value: (moaiAddValue ?? 0).toString(),
              },
              Asset: {
                currency: 'XRP',
              },
              Asset2: {
                currency: 'MOI',
                issuer: 'rPEQacsbfGADDHb6wShzTZ2ajByQFPdY3E',
              },
              Fee: '100',
              Flags: 1048576, // tfTwoAsset
            };
            submitTransaction({ transaction }) // ignore warning
              .then(response => {
                console.log('Transaction hash: ', response.result?.hash);
              })
              .catch(error => {
                console.error('Transaction submission failed', error);
              });
          });
        }
      });
    }
  };

  const handleSwapXRP = async () => {
    const result = await checkAmmExist();

    if (result) {
      isInstalled().then(response => {
        if (response.result.isInstalled) {
          getAddress().then(response => {
            const address = response.result?.address;
            console.log('address', address);

            const transaction = {
              TransactionType: 'OfferCreate',
              Account: address,
              Flags: 0,
              TakerGets: {
                currency: 'MOI',
                issuer: 'rPEQacsbfGADDHb6wShzTZ2ajByQFPdY3E',
                value: (moaiToValue ?? 0).toString(),
              },
              TakerPays: ((xrpFromValue ?? 0) * 1e6).toString(),
              Fee: '20',
            };
            submitTransaction({ transaction }) // ignore warning
              .then(response => {
                console.log('Transaction hash: ', response.result?.hash);
              })
              .catch(error => {
                console.error('Transaction submission failed', error);
              });
          });
        }
      });
    }
  };

  const handleSwapMOAI = async () => {
    const result = await checkAmmExist();

    if (result) {
      isInstalled().then(response => {
        if (response.result.isInstalled) {
          getAddress().then(response => {
            const address = response.result?.address;
            console.log('address', address);

            const transaction = {
              TransactionType: 'OfferCreate',
              Account: address,
              Flags: 0,
              TakerGets: ((xrpToValue ?? 0) * 1e6).toString(),
              TakerPays: {
                currency: 'MOI',
                issuer: 'rPEQacsbfGADDHb6wShzTZ2ajByQFPdY3E',
                value: (moaiFromValue ?? 0).toString(),
              },
              Fee: '20',
            };
            submitTransaction({ transaction }) // ignore warning
              .then(response => {
                console.log('Transaction hash: ', response.result?.hash);
              })
              .catch(error => {
                console.error('Transaction submission failed', error);
              });
          });
        }
      });
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
            <Title>XRPL TEST</Title>
            {/*
                Create AMM
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
                Provide Liquidity
             */}
            <ButtonWrapper>
              <InputWrapper>
                <InputInnerWrapper>
                  <InputTitle>XRP</InputTitle>
                  <InputTextField
                    value={xrpAddValue}
                    onChange={e => setXrpAddValue(Number(e.target.value))}
                  ></InputTextField>
                </InputInnerWrapper>
                <InputInnerWrapper>
                  <InputTitle>MOAI</InputTitle>
                  <InputTextField
                    value={moaiAddValue}
                    onChange={e => setMoaiAddValue(Number(e.target.value))}
                  ></InputTextField>
                </InputInnerWrapper>
              </InputWrapper>
              <ButtonPrimaryMedium
                text="Provide Liquidity"
                onClick={() => handleProvideLP()}
              ></ButtonPrimaryMedium>
            </ButtonWrapper>

            {/*
                Swap
            */}
            <ButtonWrapper>
              <InputWrapper>
                <InputInnerWrapper>
                  <InputTitle>From XRP</InputTitle>
                  <InputTextField
                    value={xrpFromValue}
                    onChange={e => setXrpFromValue(Number(e.target.value))}
                  ></InputTextField>
                </InputInnerWrapper>
                <InputInnerWrapper>
                  <InputTitle>To MOAI</InputTitle>
                  <InputTextField
                    value={moaiToValue}
                    onChange={e => setMoaiToValue(Number(e.target.value))}
                  ></InputTextField>
                </InputInnerWrapper>
              </InputWrapper>
              <ButtonPrimaryMedium
                text="Swap XRP to MOAI"
                onClick={() => handleSwapXRP()}
              ></ButtonPrimaryMedium>
            </ButtonWrapper>

            <ButtonWrapper>
              <InputWrapper>
                <InputInnerWrapper>
                  <InputTitle>From MOAI</InputTitle>
                  <InputTextField
                    value={moaiFromValue}
                    onChange={e => setMoaiFromValue(Number(e.target.value))}
                  ></InputTextField>
                </InputInnerWrapper>
                <InputInnerWrapper>
                  <InputTitle>To XRP</InputTitle>
                  <InputTextField
                    value={xrpToValue}
                    onChange={e => setXrpToValue(Number(e.target.value))}
                  ></InputTextField>
                </InputInnerWrapper>
              </InputWrapper>
              <ButtonPrimaryMedium
                text="Swap MAOI to XRP"
                onClick={() => handleSwapMOAI()}
              ></ButtonPrimaryMedium>
            </ButtonWrapper>
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
