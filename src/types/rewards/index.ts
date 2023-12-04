export interface IRewardsInfo {
  wave: number; // wave is null, return -1
  endsAt: Date;

  totalReward: number;

  myVolume: number;
  myReward: number;
}

export interface IRewardParticipant {
  id: number;
  rank: number;

  address: string;

  volume: number;
  premined: number;
}
