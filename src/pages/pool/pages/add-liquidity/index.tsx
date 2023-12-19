import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import tw, { css, styled } from 'twin.macro';

import { IconBack } from '~/assets/icons';

import { ButtonIconLarge } from '~/components/buttons';
import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';

import { usePopup } from '~/hooks/components';
import { useRequirePrarams } from '~/hooks/utils/use-require-params';
import { POPUP_ID } from '~/types';

import { AddLiquidityInputGroup } from '../../components/add-liquidity-input-group';

const PoolDetailAddLiquidityPage = () => {
  const navigate = useNavigate();

  const { t } = useTranslation();
  const { opened } = usePopup(POPUP_ID.WALLET_ALERT);
  const { id } = useParams();

  useRequirePrarams([!!id], () => navigate(-1));

  return (
    <Wrapper>
      <GnbWrapper banner={!!opened}>
        <Gnb />
      </GnbWrapper>
      <InnerWrapper>
        <ContentWrapper>
          <Header>
            <ButtonIconLarge icon={<IconBack />} onClick={() => navigate(-1)} />
            <Title>{t('Add liquidity')}</Title>
          </Header>

          <LiquidityWrapper>
            <AddLiquidityInputGroup />
          </LiquidityWrapper>
        </ContentWrapper>
      </InnerWrapper>
      <Footer />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  relative flex flex-col justify-between w-full h-full
`;

interface DivProps {
  banner?: boolean;
}
const GnbWrapper = styled.div<DivProps>(({ banner }) => [
  tw`
    w-full flex-center
  `,
  banner ? tw`h-124 mlg:(h-140)` : tw`h-72 mlg:(h-80)`,
]);

const Header = tw.div`
  flex items-center gap-4 font-b-24 text-neutral-100 px-20
  md:(gap-12 px-0)
  `;

const InnerWrapper = tw.div`
  flex flex-col gap-40 pt-20 pb-120
  md:pt-40
`;

const ContentWrapper = styled.div(() => [
  tw`flex flex-col items-center gap-20 
  md:gap-40
  `,
  css`
    & > div {
      width: 100%;
      max-width: 455px;
    }
  `,
]);

const Title = tw.div`
  font-b-20 h-40 flex items-center text-neutral-100
  md:font-b-24
`;

const LiquidityWrapper = tw.div`
  flex gap-40 items-start
`;

export default PoolDetailAddLiquidityPage;
