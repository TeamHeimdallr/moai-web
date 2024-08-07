export interface IWave {
  id: number;
  waveId: number;

  startAt: Date;
  endAt: Date;

  lastUpdated: Date;
}

export interface IRewardsWave0Info {
  wave: number; // wave is null, return -1
  endsAt: Date;

  totalReward: number;

  myVolume: number;
  myReward: number;

  myCampaignVolume: number;
  myCampaignReward: number;
}

export interface IRewardsWaveNInfo {
  wave: number;
  startAt: Date;
  endAt: Date;

  totalPoint: number;

  lpSupply: number;
  campaignLpSupply: number;
  lendingSupply: number;
  lendingBorrow: number;
  referees: number;
  boost: number;
  referral: string;
  veMOAI: number;
}

export interface IRewardParticipant {
  id: number;
  rank: number;

  address: string;
  rns?: string;

  volume: number;
  premined: number;
}
export interface IRewardWaveNParticipant {
  id: number;
  rank: number;

  address: string;
  rns?: string;

  lpSupply: number;
  lendingSupply: number;
  lendingBorrow: number;
  referees: number;
  total: number;
  boost: number;
}
