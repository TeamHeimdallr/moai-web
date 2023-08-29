import { rest } from 'msw';

import db from '~/_mocks_/data-server';
import { API_URL } from '~/constants';

export default [
  // DELETE /users/me
  rest.delete(`${API_URL}/users/:id`, async (req, res, ctx) => {
    const id = Number(req.params.id);
    const deleted = db.users.delete({ where: { id: { equals: id } } });

    return res(ctx.status(200), ctx.json({ data: deleted, message: 'success' }));
  }),
];
