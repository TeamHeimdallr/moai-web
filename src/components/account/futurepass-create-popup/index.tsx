import { useState } from 'react';
import copy from 'copy-to-clipboard';
import tw, { css, styled } from 'twin.macro';

import { useCreateFuturepass } from '~/api/api-contract/_evm/substrate/create-futurepass';

import { COLOR } from '~/assets/colors';
import { IconAlert, IconCheck, IconCopy, IconLink } from '~/assets/icons';
import { imageWalletFuturepass } from '~/assets/images';
import { termsAndConditions } from '~/assets/text/fp-terms-and-conditions.ts';

import { SCANNER_URL } from '~/constants';

import { ButtonIconSmall, ButtonPrimaryLarge } from '~/components/buttons';
import { Checkbox } from '~/components/inputs';
import { List } from '~/components/lists';
import { Popup } from '~/components/popup';

import { usePopup } from '~/hooks/components';
import { useConnectedWallet } from '~/hooks/wallets';
import { NETWORK, POPUP_ID } from '~/types';

export const FuturepassCreatePopup = () => {
  const { close } = usePopup(POPUP_ID.FUTUREPASS_CREATE);
  const { fpass } = useConnectedWallet();
  const { createFuturepass, isError, errorCode } = useCreateFuturepass();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [checked, check] = useState(false);

  const button = () => {
    if (step === 0) {
      return <ButtonPrimaryLarge onClick={() => setStep(1)} text="Continue" />;
    } else if (step === 1) {
      return (
        <ButtonPrimaryLarge
          disabled={!checked}
          isLoading={isLoading}
          onClick={async () => {
            setIsLoading(true);
            await createFuturepass();
            fpass.refetch();
            setIsLoading(false);
            setStep(2);
          }}
          text={isLoading ? 'Creating your futurepass...' : 'Create Futurepass'}
        />
      );
    } else {
      return <ButtonPrimaryLarge onClick={() => close()} text="Confirm" />;
    }
  };

  return (
    <Popup id={POPUP_ID.FUTUREPASS_CREATE} title="" button={button()}>
      {step === 0 ? (
        <Wrapper>
          <Title>Create Futurepass</Title>
          <Text>
            {
              'To connect the Futurepass, your agreement to the terms of service and privacy policy is required.'
            }
          </Text>
        </Wrapper>
      ) : step === 1 ? (
        <Wrapper>
          <Title>Terms and conditions</Title>
          <Scroll>{termsAndConditions}</Scroll>
          <CheckTerm>
            <Checkbox onClick={() => check(prev => !prev)} selected={checked} />
            <CheckText>I have read and agreed to the Terms and conditions.</CheckText>
          </CheckTerm>
        </Wrapper>
      ) : fpass.address ? (
        <Wrapper>
          <IconWrapper>
            <IconCheck width={40} height={40} />
          </IconWrapper>
          <Title>Creation Confirmed!</Title>
          <Text>{'You have successfully created your Futurepass account.'}</Text>
          <List title={`Your FuturePass address`}>
            <Account>
              <Logo>
                <InnerLogo src={imageWalletFuturepass} alt="futurepass" />
              </Logo>
              <AddressWrapper>
                <AddressTextWrapper>
                  <MediumText>{fpass.address}</MediumText>
                  <InnerWrapper>
                    {/* TODO: Copied! 문구 2초 노출 */}
                    <ButtonIconSmall icon={<IconCopy />} onClick={() => copy(fpass.address)} />
                    <ButtonIconSmall
                      icon={<IconLink />}
                      onClick={() =>
                        window.open(
                          `${SCANNER_URL[NETWORK.THE_ROOT_NETWORK]}/address/${fpass.address}`
                        )
                      }
                    />
                  </InnerWrapper>
                </AddressTextWrapper>
              </AddressWrapper>
            </Account>
          </List>
        </Wrapper>
      ) : isError && errorCode === 1010 ? (
        <Wrapper>
          <IconAlert width={60} height={60} fill={COLOR.RED[50]} />
          <Title>Insufficient $XRP tokens</Title>
          <Text>
            To proceed with the transaction, make sure you have enough $XRP tokens in your wallet.
          </Text>
        </Wrapper>
      ) : isError && errorCode.toString().includes('InsufficientBalance') ? (
        <Wrapper>
          <IconAlert width={60} height={60} fill={COLOR.RED[50]} />
          <Title>Insufficient $ROOT tokens</Title>
          <Text>
            To proceed with the transaction, make sure you have enough $ROOT tokens in your wallet.
          </Text>
        </Wrapper>
      ) : isError ? (
        <Wrapper>
          <IconAlert width={60} height={60} fill={COLOR.RED[50]} />
          <Title>Failed to creating account</Title>
          <Text>
            FuturePass account creation has failed. Please go back to previous page and try again.
          </Text>
        </Wrapper>
      ) : (
        <></>
      )}
    </Popup>
  );
};

const Wrapper = tw.div`
  flex flex-col items-center gap-12 px-24 pb-48
`;

const Title = tw.div`
  font-b-24 text-neutral-100
`;

const Text = tw.div`
  font-r-16 text-neutral-80 text-center
`;

const Scroll = styled.div(() => [
  tw`
      flex flex-col w-full max-h-368 overflow-auto text-neutral-90 whitespace-pre-wrap bg-neutral-5 rounded-8 gap-8 py-16 pl-20 pr-24 font-r-12
    `,
  css`
    scroll-behavior: smooth;
    &::-webkit-scrollbar {
      width: 4px;
      height: auto;
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      visibility: hidden;
      background: #515a68;
      -webkit-border-radius: 2px;
    }
    &:hover::-webkit-scrollbar-thumb {
      visibility: visible;
    }
  `,
]);
const IconWrapper = tw.div`
  flex-center w-48 h-48 rounded-full bg-green-50
`;

const CheckTerm = tw.div`flex gap-16 font-r-14 text-neutral-100 items-start w-full`;
interface DivProps {
  error?: boolean;
}
const CheckText = styled.div<DivProps>(({ error }) => [error && tw`text-red-50`]);
const Logo = tw.div`
  rounded-full bg-neutral-0 w-40 h-40 flex-center flex-shrink-0
`;
const InnerLogo = tw.img`
  rounded-full bg-neutral-0 w-24 h-24 flex-center flex-shrink-0
`;
const Account = tw.div`
  flex gap-12 px-16 py-12 w-full items-center
`;
const AddressWrapper = tw.div`
  flex flex-col w-full
`;
const MediumText = tw.div`
  text-neutral-100 font-r-14 address w-250 break-all
`;
const AddressTextWrapper = tw.div`flex justify-between`;
const InnerWrapper = tw.div`
  flex-center
`;
