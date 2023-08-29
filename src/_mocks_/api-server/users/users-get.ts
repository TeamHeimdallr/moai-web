import { rest } from 'msw';

import db from '~/_mocks_/data-server';
import { API_URL } from '~/constants';

export default [
  /**
   * Get all users
   * GET /users
   */
  rest.get(`${API_URL}/users`, async (req, res, ctx) => {
    const searchParams = req.url.searchParams;
    const page = Number(searchParams.get('page'));
    const size = Number(searchParams.get('size'));

    const numUsers = db.users.count();
    const users = db.users.findMany({
      take: size || 10,
      skip: (page - 1) * size || 0,
    });

    return res(ctx.status(200), ctx.json({ data: { numUsers, users }, message: 'success' }));
  }),
];
