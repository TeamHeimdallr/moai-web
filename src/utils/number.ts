import { format } from 'd3-format';

import { FORMAT_NUMBER_THRESHOLD } from '~/constants';

/**
 * automatically trim zero
 *
 * parseFixedDecimal(0.123) === 0.12
 * parseFixedDecimal(0.123, 1) === 0.1
 * parseFixedDecimal(0.123, 5) === 0.123
 */
export const formatFloat = (num: number, decimal = 2) => format(`.${decimal}~f`)(num);

/**
 * parsePercent(0.123) === 12%
 * parsePercent(0.128) === 13%
 */
export const formatPercent = (num: number, decimal?: number) =>
  format(`${decimal ? `.${decimal}` : '~'}%`)(num);

/**
 * parseNumberWithUnit(42e6) === 42M
 */
export const formatNumberWithUnit = (num: number, decimal = 4) => format(`.${decimal}s`)(num);

/**
 * parseNumberWithComma(10000) === 10,000
 */
export const formatNumberWithComma = (num: number) => format(',~')(num);

/**
 * parseNumber(10000.12345) === 10,000.1235
 * parseNumber(10000) === 10,000
 * parseNumber(20000000) === 10M (threshold = 10000000)
 */
export const formatNumber = (data?: number | string, decimal = 4) => {
  const formattedNumber = Number(formatFloat(Number(data ?? 0), decimal));
  const formattedWithUnit =
    formattedNumber > FORMAT_NUMBER_THRESHOLD
      ? formatNumberWithUnit(formattedNumber)
      : formatNumberWithComma(formattedNumber);

  return formattedWithUnit;
};
