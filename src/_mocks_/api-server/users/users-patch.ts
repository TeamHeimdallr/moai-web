import { rest } from 'msw';

import db from '~/_mocks_/data-server';
import { API_URL } from '~/constants';

export default [
  /**
   * Update user
   * PATCH /users/:id
   */
  rest.patch(`${API_URL}/users/:id`, async (req, res, ctx) => {
    const id = Number(req.params.id);
    const data = await req.json();

    const modified = db.users.update({
      where: { id: { equals: id } },
      data,
    });

    return res(ctx.status(200), ctx.json({ data: modified, message: 'success' }));
  }),
];
