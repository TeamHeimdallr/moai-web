import { useTranslation } from 'react-i18next';
import tw from 'twin.macro';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { Popup } from '~/components/popup';

import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { usePopup } from '~/hooks/components/use-popup';
import { POPUP_ID } from '~/types/components';

interface Props {
  code: string;
}
export const RewardBoundReferralPopup = ({ code }: Props) => {
  const { ref } = useGAInView({ name: 'bound-referral' });

  const { close } = usePopup(POPUP_ID.REWARD_BOUND_REFERRAL);
  const { t } = useTranslation();

  return (
    <Popup
      id={POPUP_ID.REWARD_BOUND_REFERRAL}
      title={t('Bound Referrer')}
      button={<ButtonPrimaryLarge text={t('Ok')} onClick={() => close()} />}
    >
      <Wrapper ref={ref}>
        <Description>{t('bound-referrer-popup-description')}</Description>
        <Code>{code}</Code>
      </Wrapper>
    </Popup>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-24 px-24 pb-24
`;

const Description = tw.div`
  font-r-14 text-neutral-100
`;

const Code = tw.div`
  p-16 font-m-24 text-neutral-100 bg-neutral-15 rounded-8 text-center
`;
