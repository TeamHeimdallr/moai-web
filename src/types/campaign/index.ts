import { NETWORK } from '..';

export interface ICampaign {
  id: string;

  name: string;
  networks: NETWORK[];

  startDate: Date;
  endDate: Date;

  active: boolean;
}
