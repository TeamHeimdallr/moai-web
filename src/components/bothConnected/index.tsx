import tw from 'twin.macro';

export const BothConnected = () => {
  return (
    <Wrapper>
      <Wallet></Wallet>
      <Wallet></Wallet>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex items-center bg-neutral-10 py-9 px-8 rounded-10
`;
const Wallet = tw.img`w-28 h-28 bg-neutral-20 border-1 border-neutral-15 rounded-14`;
