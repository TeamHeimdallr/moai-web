import { COLOR } from '~/assets/colors';

export const calculateHealthFactorColor = (hf: number) => {
  if (hf >= 1.75) return COLOR.GREEN[50];
  if (hf > 1.5 && hf <= 1.75) return COLOR.PRIMARY[50];
  if (hf > 1.25 && hf <= 1.5) return COLOR.ORANGE[50];
  return COLOR.RED[50];
};

export const calculateCurrentLTVColor = (ltv: number) => {
  if (ltv > 65) return COLOR.RED[50];
  if (ltv > 50 && ltv <= 65) return COLOR.ORANGE[50];
  if (ltv > 35 && ltv <= 50) return COLOR.PRIMARY[50];
  return COLOR.GREEN[50];
};
