import { useWeb3Modal } from '@web3modal/react';
import tw from 'twin.macro';

import { useGetUsersQuery } from '~/api/api-server/users/users-get';
import { ButtonSmall } from '~/components/buttons/small';
import { useConnectWallet } from '~/hooks/data/use-connect-wallet';

const MainPage = () => {
  const { isOpen, open } = useWeb3Modal();
  const { isConnected, truncatedAddress, disconnect } = useConnectWallet();
  const { data } = useGetUsersQuery();

  return (
    <Wrapper>
      <Text>{isConnected ? truncatedAddress : 'not connected'}</Text>
      <Text>{data?.data.numUsers}</Text>
      <ButtonSmall
        text={isConnected ? 'disconnect' : 'connect'}
        isLoading={isOpen}
        onClick={isConnected ? () => disconnect() : () => open()}
      />
    </Wrapper>
  );
};

const Wrapper = tw.div``;
const Text = tw.div`
  font-r-14
`;

export default MainPage;
