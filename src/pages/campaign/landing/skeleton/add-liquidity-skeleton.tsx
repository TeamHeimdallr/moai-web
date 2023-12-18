import { useTranslation } from 'react-i18next';
import tw from 'twin.macro';

import { ButtonSkeleton } from '~/components/skeleton/button-skeleton';
import { ListSkeleton } from '~/components/skeleton/list-skeleton';

import { NETWORK } from '~/types/networks';

export const AddLiquiditySkeleton = () => {
  const { t } = useTranslation();
  return (
    <Wrapper>
      <ListSkeleton title={t("You're providing")} network={NETWORK.XRPL} height={150} />
      <ListSkeleton
        title={t('Expected APR (10%)')}
        network={NETWORK.THE_ROOT_NETWORK}
        height={191}
      />
      <ButtonSkeleton />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full flex flex-col p-24 bg-neutral-10 rounded-12 gap-20
  md:gap-24
`;
