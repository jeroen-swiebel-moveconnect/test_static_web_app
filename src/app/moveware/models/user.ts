export class Role {
    roleId: number;
    name: string;
}

export class User {
    userId: number;
    username: string;
    password: string;
    firstname: string;
    lastname: string;
    email: string;
    roles: Role[] = [];
}

export class Login {
    username: string;
    password: string;
}
