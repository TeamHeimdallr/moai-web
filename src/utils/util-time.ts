import { formatDistanceToNowStrict, formatDuration, intervalToDuration } from 'date-fns';

export const DATE_FORMATTER = {
  MMM_d_yyyy: 'MMM d, yyyy',
  HH_A_0: 'h a O',
  HHMM_AA_mm_dd: 'h:mm aa, MMM d',
  HHMMSS: 'HH:mm:ss',
  FULL: 'ccc, MMM dd, yyyy, hh:mm:ss a O',
};

export const elapsedTime = (timestamp: number, suffix: string = ' ago') => {
  const diff = Date.now() - timestamp;
  if (diff < 60000) {
    return 'Just now';
  } else {
    return formatDistanceToNowStrict(timestamp) + suffix;
  }
};

export const getRemainElapsedTime = (timestamp: number, suffix: string = ' ago') => {
  const diff = timestamp - Date.now();
  if (diff < 60000) {
    return 'Just now';
  } else {
    return formatDistanceToNowStrict(timestamp) + suffix;
  }
};

interface FormatRegexp {
  regexp: RegExp;
  str: string;
}
/**
 * default res example '2 years 9 months 1 week 7 days 5 hours 9 minutes 30 seconds'
 * getRemainTime(time, now, [{ regexp: / years?/, str: '년' }]) === '2년 9 months 1 week 7 days 5 hours 9 minutes 30 seconds'
 */
export const getRemainTime = (time: Date, now = new Date(), formatRegexp?: FormatRegexp[]) => {
  if (now.getTime() >= time.getTime()) return '';

  const duration = intervalToDuration({ start: now, end: time });
  const formattedDuration = formatDuration(duration);

  let res = formattedDuration;
  formatRegexp?.forEach(({ regexp, str }) => {
    res = res.replace(regexp, str);
  });

  return res;
};
