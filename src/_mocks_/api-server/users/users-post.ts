import { rest } from 'msw';

import db from '~/_mocks_/data-server';
import { API_URL } from '~/constants';

export default [
  /**
   * Create user
   * POST /users
   */
  rest.post(`${API_URL}/users`, async (req, res, ctx) => {
    const data = await req.json();

    const created = db.users.create({
      id: db.users.count() + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    });

    return res(ctx.status(201), ctx.json({ data: created, message: 'success' }));
  }),
];
