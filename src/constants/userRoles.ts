import {UserRoleDocument} from "types/constants";

enum UserRoleId {
    User = 1,
    Author,
    Editor,
    Admin,
    SuperAdmin
}

const UserRoles: Array<UserRoleDocument> = [
    {id: UserRoleId.User, rank: 1, rank: 1, langKey: "user"},
    {id: UserRoleId.Author, rank: 2, rank: 2, langKey: "author"},
    {id: UserRoleId.Editor, rank: 3, rank: 3, langKey: "editor"},
    {id: UserRoleId.Admin, rank: 4, rank: 4, langKey: "admin"},
    {id: UserRoleId.SuperAdmin, rank: 5, rank: 5, langKey: "superAdmin"}
]

export {UserRoles, UserRoleId};
