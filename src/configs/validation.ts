import { parseEther } from 'viem';
import * as yup from 'yup';

import { parseComma } from '~/utils/util-string';

yup.addMethod(yup.string, 'maximum', function (max: string, message: string) {
  return this.test({
    name: 'maximum',
    message: message,
    params: { max },
    test: value => {
      const parsedValue = parseEther(parseComma(value || '0'));
      const parsedMax = parseEther(max || '0');

      return parsedValue <= parsedMax;
    },
  });
});

yup.addMethod(yup.string, 'minimum', function (min: string, message: string) {
  return this.test({
    name: 'minimum',
    message: message,
    params: { min },
    test: value => {
      const parsedValue = parseEther(parseComma(value || '0'));
      const parsedMin = parseEther(min || '0');

      return parsedValue >= parsedMin;
    },
  });
});
