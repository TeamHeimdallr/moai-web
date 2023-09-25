// import { useState } from 'react';
// import tw, { css, styled } from 'twin.macro';

// import { useGetAmmInfo } from '~/api/xrpl/get-amm';

// import { ButtonPrimaryMedium } from '~/components/buttons/primary';
// import { Footer } from '~/components/footer';
// import { InputTextField } from '~/components/inputs/textfield';

// import { Gnb } from '~/moai-xrp-ledger/components/gnb';

// export const XrplTestPage = () => {
//   const [xrpValue, setXrpValue] = useState(0);
//   const [moaiValue, setMoaiValue] = useState(0);
//   const { checkAmmExist, ammInfo } = useGetAmmInfo({
//     asset1: {
//       currency: 'XRP',
//     },
//     asset2: {
//       currency: 'MOI',
//       issuer: 'rPEQacsbfGADDHb6wShzTZ2ajByQFPdY3E',
//     },
//   });

//   const handleCreateLP = async () => {
//     const result = await checkAmmExist();
//     console.log('result', result);

//     if (!result) {
//       const ammcreate_result = await client.submitAndWait(
//         {
//           TransactionType: 'AMMCreate',
//           Account: wallet.address,
//           Amount: {
//             currency: 'TST',
//             issuer: 'rP9jPyP5kyvFRb6ZiRghAGw5u8SGAmU4bd',
//             value: '15',
//           },
//           Amount2: {
//             currency: foo_amount.currency,
//             issuer: foo_amount.issuer,
//             value: '100',
//           },
//           TradingFee: 500,
//           Fee: amm_fee_drops,
//         },
//         { autofill: true, wallet: wallet, fail_hard: true }
//       );
//       // Use fail_hard so you don't waste the tx cost if you mess up
//       if (ammcreate_result.result.meta.TransactionResult == 'tesSUCCESS') {
//         console.log(`AMM created: ${EXPLORER}/transactions/${ammcreate_result.result.hash}`);
//       } else {
//         throw `Error sending transaction: ${ammcreate_result}`;
//       }
//     }
//   };

//   return (
//     <>
//       <Wrapper>
//         <GnbWrapper>
//           <Gnb />
//         </GnbWrapper>
//         <InnerWrapper>
//           <ContentWrapper>
//             <Title>XRPL TEST {ammInfo && ammInfo.result?.toString()} </Title>
//             {/*
//                 Provide LP
//              */}
//             <ButtonWrapper>
//               <InputWrapper>
//                 <InputInnerWrapper>
//                   <InputTitle>XRP</InputTitle>
//                   <InputTextField
//                     value={xrpValue}
//                     onChange={e => setXrpValue(Number(e.target.value))}
//                   ></InputTextField>
//                 </InputInnerWrapper>
//                 <InputInnerWrapper>
//                   <InputTitle>MOAI</InputTitle>
//                   <InputTextField
//                     value={moaiValue}
//                     onChange={e => setMoaiValue(Number(e.target.value))}
//                   ></InputTextField>
//                 </InputInnerWrapper>
//               </InputWrapper>
//               <ButtonPrimaryMedium
//                 text="Create LP"
//                 onClick={() => handleCreateLP()}
//               ></ButtonPrimaryMedium>
//             </ButtonWrapper>

//             {/*
//                 Swap
//             */}
//           </ContentWrapper>
//         </InnerWrapper>
//         <Footer />
//       </Wrapper>
//     </>
//   );
// };

// const Wrapper = tw.div`
//   relative flex flex-col justify-between w-full h-full
// `;

// const GnbWrapper = tw.div`
//   w-full h-80 flex-center
// `;

// const InnerWrapper = tw.div`
//   flex flex-col gap-40 pt-40 pb-120
// `;

// const ContentWrapper = styled.div(() => [
//   tw`flex flex-col items-center gap-40`,
//   css`
//     & > div {
//       width: 100%;
//       max-width: 786px;
//     }
//   `,
// ]);

// const Title = tw.div`
//   font-b-24 h-40 flex items-center text-neutral-100
// `;

// const InputInnerWrapper = tw.div`
// `;

// const InputTitle = tw.div`
//   font-r-16 text-neutral-100
// `;

// const InputWrapper = tw.div`
//   flex gap-10
// `;

// const ButtonWrapper = tw.div`
//   flex flex-col gap-10 items-start
// `;
