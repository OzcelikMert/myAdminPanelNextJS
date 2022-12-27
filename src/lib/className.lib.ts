import {StatusId, UserRoleId} from "constants/index";

export default {
    getStatusClassName(statusId: number): string {
        let bg = ``;
        switch (statusId) {
            case StatusId.Active:
                bg = `success`;
                break;
            case StatusId.Pending:
            case StatusId.Banned:
                bg = `danger`;
                break;
            case StatusId.InProgress:
                bg = `warning`;
                break;
            case StatusId.Deleted:
            case StatusId.Disabled:
                bg = `dark`;
                break;
        }
        return bg;
    },
    getUserRolesClassName(roleId: UserRoleId): string {
        let bg = ``;
        switch (roleId) {
            case UserRoleId.SuperAdmin:
                bg = `dark`;
                break;
            case UserRoleId.Admin:
                bg = `primary`;
                break;
            case UserRoleId.Editor:
                bg = `danger`;
                break;
            case UserRoleId.Author:
                bg = `success`;
                break;
            case UserRoleId.User:
                bg = `info`;
                break;
        }
        return bg;
    }
}