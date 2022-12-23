import {UserRoleDocument} from "types/constants";

enum UserRoleId {
    User = 1,
    Author,
    Editor,
    Admin,
    SuperAdmin
}

const UserRoles: Array<UserRoleDocument> = [
    {id: UserRoleId.User, rank: 1, order: 1, langKey: "user"},
    {id: UserRoleId.Author, rank: 2, order: 2, langKey: "author"},
    {id: UserRoleId.Editor, rank: 3, order: 3, langKey: "editor"},
    {id: UserRoleId.Admin, rank: 4, order: 4, langKey: "admin"},
    {id: UserRoleId.SuperAdmin, rank: 5, order: 5, langKey: "superAdmin"}
]

export {UserRoles, UserRoleId};
