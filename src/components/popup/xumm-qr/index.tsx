import { useTranslation } from 'react-i18next';
import tw from 'twin.macro';

import { useXummQrStore } from '~/states/components/xumm-qr';
import { POPUP_ID } from '~/types';

import { Popup } from '..';

export const XummQrPopup = () => {
  const { qr } = useXummQrStore();
  const { t } = useTranslation();

  return (
    <Popup
      id={POPUP_ID.XUMM_QR}
      title={t('Action required in wallet')}
      zIndex={22}
      maxWidth={372.5}
    >
      <Wrapper>
        <QrWrapper>
          <Qr style={{ backgroundImage: `url(${qr})` }} />
        </QrWrapper>
        <Text>{t('xumm-qr-description')}</Text>
      </Wrapper>
    </Popup>
  );
};

const Wrapper = tw.div`
  flex flex-col items-center gap-24 px-24 pt-4 pb-24
`;
const QrWrapper = tw.div`
  p-24 rounded-24 bg-center bg-cover bg-no-repeat bg-white flex-center
`;
const Qr = tw.div`
  bg-center bg-cover bg-no-repeat w-180 h-180
`;
const Text = tw.div`
  font-m-16 text-neutral-80 text-center
`;

export default XummQrPopup;
