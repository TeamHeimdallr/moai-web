import { nullable, primaryKey } from '@mswjs/data';

import { User } from '~/types';

/**
 * factory
 */
export const usersFactory = {
  id: primaryKey(Number),
  nickname: nullable(String),

  createdAt: nullable(() => new Date()),
  updatedAt: nullable(() => new Date()),
};

/**
 * mock data
 */
export type UsersForFatory = Omit<User, 'id'>;
export const usersMock: UsersForFatory[] = [
  {
    nickname: 'nickname',

    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
