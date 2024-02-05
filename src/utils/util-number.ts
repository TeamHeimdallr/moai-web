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
export const formatFloor = (num: number, decimal = 2) =>
  Math.floor(num * Math.pow(10, decimal)) / Math.pow(10, decimal);

/**
 * parsePercent(0.123) === 12%
 * parsePercent(0.128) === 13%
 */
export const formatPercent = (num: number, decimal?: number) =>
  format(`${decimal ? `.${decimal}` : '~'}%`)(num);

/**
 * parseNumberWithUnit(42e6) === 42M
 */
const formatter = Intl.NumberFormat('en', { notation: 'compact' });
export const formatNumberWithUnit = (num: number) => formatter.format(num);

/**
 * parseNumberWithComma(10000) === 10,000
 */
export const formatNumberWithComma = (num: number) => format(',~')(num);

/**
 * parseNumber(10000.12345) === 10,000.1235
 * parseNumber(10000) === 10,000
 * parseNumber(20000000) === 10M (threshold = 10000000)
 */
export const formatNumber = (
  data?: number | string,
  decimal = 4,
  type: 'round' | 'floor' = 'round',
  threshold: number = FORMAT_NUMBER_THRESHOLD
) => {
  const formattedNumber =
    type === 'round'
      ? Number(formatFloat(Number(data || 0), decimal))
      : formatFloor(Number(data || 0), decimal);

  const formattedWithUnit =
    formattedNumber > threshold
      ? formatNumberWithUnit(formattedNumber)
      : formatNumberWithComma(formattedNumber);

  return formattedWithUnit;
};
