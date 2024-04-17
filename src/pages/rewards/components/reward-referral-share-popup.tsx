import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import copy from 'copy-to-clipboard';
import tw from 'twin.macro';

import { BASE_URL_WITHOUT_HTTPS } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { Popup } from '~/components/popup';

import { POPUP_ID } from '~/types/components';

interface Props {
  code: string;
}
export const RewardReferralSharePopup = ({ code }: Props) => {
  const { t } = useTranslation();

  const data =
    '#GMOAI Introducing you to Universal Gateway to the Multi-chain Liquidity @MoaiFinance🗿 \n\n' +
    `Get 5% more points with this link: ${BASE_URL_WITHOUT_HTTPS}/rewards?referral=${code}\n\n` +
    '$XRP $ROOT';

  const [buttonText, setButtonText] = useState('Copy to share');

  const handleCopy = () => {
    copy(data);

    setButtonText('Copied!');
    setTimeout(() => setButtonText(code || ''), 2000);
  };
  return (
    <Popup
      id={POPUP_ID.REWARD_REFERRAL_SHARE}
      title={t('Share referral link')}
      button={<ButtonPrimaryLarge text={t(buttonText)} onClick={() => handleCopy()} />}
    >
      <Wrapper>
        <Code>{data}</Code>
      </Wrapper>
    </Popup>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-24 px-24 pb-24
`;

const Code = tw.div`
  p-16 font-r-16 text-neutral-100 bg-neutral-15 rounded-8 whitespace-pre-wrap
`;
