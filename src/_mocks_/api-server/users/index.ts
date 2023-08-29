import deleteUsers from './users-delete';
import getUsers from './users-get';
import patchUsers from './users-patch';
import postUsers from './users-post';

export default [...getUsers, ...postUsers, ...patchUsers, ...deleteUsers];
