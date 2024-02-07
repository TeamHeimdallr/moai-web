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
const formatter = (digit = 2) =>
  Intl.NumberFormat('en', { notation: 'compact', maximumSignificantDigits: digit });
export const formatNumberWithUnit = (num: number, digit?: number) => formatter(digit).format(num);

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
  threshold: number = FORMAT_NUMBER_THRESHOLD,
  fixedDecimal: number = 0
) => {
  const formattedNumber =
    type === 'round'
      ? Number(formatFloat(Number(data || 0), decimal + 2))
      : formatFloor(Number(data || 0), decimal);

  const formattedWithUnit =
    formattedNumber > threshold
      ? formatNumberWithUnit(formattedNumber, decimal + 2 || 1)
      : formatNumberWithComma(formattedNumber);

  if (fixedDecimal) {
    const regex = /[a-zA-z]/;
    const hasUnit = regex.test(formattedWithUnit);

    if (hasUnit) {
      // ['M', index: 6, input: '123.12M', groups: undefined]
      const unitIndex = formattedWithUnit.search(regex);
      const unit = formattedWithUnit.slice(unitIndex, unitIndex + 1);

      const num = formattedWithUnit.slice(0, unitIndex);
      const fixedNum = Number(num).toFixed(fixedDecimal);

      return `${fixedNum}${unit}`;
    }

    const fixedNum = Number(formattedWithUnit).toFixed(fixedDecimal);
    return fixedNum;
  }

  return formattedWithUnit;
};
