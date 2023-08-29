export interface User {
  id: number;
  nickname: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  nickname: string;
}
export interface UpdateUserRequest extends Omit<User, 'createdAt'> {}

export type DeleteUsersRequest = Pick<User, 'id'>;
