import { useTranslation } from 'react-i18next';
import tw, { styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconNext } from '~/assets/icons';

import { ButtonPrimaryMedium } from '~/components/buttons';

import { formatNumber } from '~/utils';

import { BridgeHistory } from './bridge-history';

export const Pending = () => {
  // TODO : connect API
  const balance = 123;
  // TODO : navigate step3
  const handleClick = () => {};
  const { t } = useTranslation();
  return (
    <Wrapper>
      <TitleWrapper>
        <Title>Pending</Title>

        <Balance>{formatNumber(balance, 2)} XRP</Balance>
        <ButtonWrapper>
          <ButtonPrimaryMedium
            icon={<IconNext fill={COLOR.NEUTRAL[0]} width={20} height={20} />}
            text={t('Continue')}
            onClick={handleClick}
          />
        </ButtonWrapper>
      </TitleWrapper>
      <BridgeHistory />
    </Wrapper>
  );
};

const Wrapper = styled.div(() => [
  tw`w-full flex flex-col gap-24 bg-neutral-10 rounded-12 px-24 pt-20 pb-24 mt-24`,
]);
const TitleWrapper = tw.div`flex justify-between items-center font-m-20 gap-12`;
const Title = tw.div`
  flex-1 text-neutral-100 font-b-18 md:font-b-20
`;
const ButtonWrapper = tw.div``;
const Balance = tw.div`flex`;
