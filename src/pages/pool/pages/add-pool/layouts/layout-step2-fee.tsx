import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import tw from 'twin.macro';
import * as yup from 'yup';

import { COLOR } from '~/assets/colors';

import { ButtonPrimaryLarge } from '~/components/buttons';

import { formatComma, parseComma } from '~/utils';

import { InputPercentage } from '../components/input-percentage';
import { useStep } from '../hooks/use-step';
import { useXrplPoolAddTokenPairStore } from '../states/token-pair';

const name = 'INPUTS_PERCENTAGE';
export const Fee = () => {
  const { t } = useTranslation();

  const { setStepStatus, goNext } = useStep();
  const { initialFee, setInitialFee } = useXrplPoolAddTokenPairStore();

  const schema = yup.object().shape({
    [name]: yup.string().maximum('1', t('Exceeds 1%')),
  });

  const methods = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });
  const { watch, formState } = methods;

  const errorMessage = useMemo(
    () => formState.errors?.[name]?.message,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formState.errors?.[name]]
  );
  const value = watch(name);

  useEffect(() => {
    setInitialFee(Number(parseComma(value || '')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (!!errorMessage || !initialFee || initialFee > 1) {
      setStepStatus({ status: 'idle', id: 2 }, 1);
      return;
    }

    setStepStatus({ status: 'done', id: 2 }, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorMessage, initialFee]);

  return (
    <FormProvider {...methods}>
      <Wrapper>
        <InputPercentage
          name={name}
          label={
            <LabelWrapper>
              {t('Inital trading fee')}
              <span style={{ fontSize: '14px', color: COLOR.NEUTRAL[60] }}>{t('Up to 1%')}</span>
            </LabelWrapper>
          }
          defaultValue={initialFee ? formatComma(initialFee?.toString() || '') : ''}
          placeholder="0"
          error={!!errorMessage}
          errorMessage={errorMessage}
        />
        <ButtonPrimaryLarge
          text={t('Next')}
          disabled={!!errorMessage || !value || !initialFee}
          onClick={goNext}
        />
      </Wrapper>
    </FormProvider>
  );
};

const Wrapper = tw.div`
  w-full p-24 rounded-12 bg-neutral-10
  flex flex-col gap-24
`;

const LabelWrapper = tw.div`
  flex flex-col gap-2 font-r-16 text-neutral-100
`;
