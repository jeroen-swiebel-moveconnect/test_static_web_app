import { User } from '../models/user';

import { BaseResponse } from './base.response';

export class UsersResponse extends BaseResponse {
    users: User[] = [];
}
