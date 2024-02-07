import { FORMAT_NUMBER_THRESHOLD } from '~/constants';

export const formatNumber = (
  data?: number | string,
  decimal = 2,
  type: 'round' | 'floor' = 'floor',
  threshold: number = FORMAT_NUMBER_THRESHOLD,
  fixedDecimal: number = 0
) => {
  if (!data) return '';

  const number = Number(data);
  if (isNaN(number)) return '';

  // 단위 설정
  const units = ['', 'K', 'M', 'B', 'T', 'P', 'E'];
  let unitIndex = 0;
  let absNumber = Math.abs(number);

  while (absNumber >= threshold && unitIndex < units.length - 1) {
    absNumber /= threshold;
    unitIndex++;
  }

  // 소수점 처리
  let formattedNumber: string;

  const currentDecimal = number.toString().split('.')[1]?.length || 0;
  const decimalPlaces = fixedDecimal ? fixedDecimal : Math.min(decimal, currentDecimal);

  if (type === 'round') {
    formattedNumber = absNumber.toFixed(decimalPlaces);

    if (!fixedDecimal) {
      formattedNumber = Number(formattedNumber).toString();
    }
  } else {
    formattedNumber = (
      Math.floor(absNumber * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces)
    )
      .toFixed(decimalPlaces)
      .toString();

    if (!fixedDecimal) {
      formattedNumber = Number(formattedNumber).toString();
    }
  }

  // 마지막 0 제거
  if (fixedDecimal > 0 && formattedNumber.endsWith('.')) {
    formattedNumber = formattedNumber.slice(0, -1);
  }

  // 부호 처리
  if (number < 0) {
    formattedNumber = '-' + formattedNumber;
  }

  // 단위 추가
  if (unitIndex > 0) {
    const currentDecimal = formattedNumber.split('.')[1]?.length || 0;
    if (currentDecimal > 3) {
      const numFormattedNumber = Number(formattedNumber);
      if (type === 'round') {
        formattedNumber = numFormattedNumber.toFixed(3);
      } else {
        formattedNumber = (
          Math.floor(numFormattedNumber * Math.pow(10, 3)) / Math.pow(10, 3)
        ).toString();
      }
    }
    formattedNumber += units[unitIndex];
  }

  // 콤마 추가
  if (unitIndex > 0) {
    const sliced = formattedNumber.slice(0, formattedNumber.length - 1);
    // eslint-disable-next-line prefer-const
    let [integerPart, decimalPart] = sliced.split('.');

    integerPart = integerPart.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    if (decimalPart) {
      formattedNumber = `${integerPart}.${decimalPart}`;
    } else {
      formattedNumber = integerPart;
    }

    formattedNumber += units[unitIndex];
  } else {
    // eslint-disable-next-line prefer-const
    let [integerPart, decimalPart] = formattedNumber.split('.');

    integerPart = integerPart.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    if (decimalPart) {
      formattedNumber = `${integerPart}.${decimalPart}`;
    } else {
      formattedNumber = integerPart;
    }
  }

  return formattedNumber;
};
