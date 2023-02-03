import {StatusId, UserRoleId} from "constants/index";

export default {
    getStatus(statusId: number): string {
        let className = ``;
        switch (statusId) {
            case StatusId.Active: className = `success`; break;
            case StatusId.Pending:
            case StatusId.Banned:
            case StatusId.Disabled: className = `dark`; break;
            case StatusId.InProgress: className = `warning`; break;
            case StatusId.Deleted: className = `danger`; break;
        }
        return className;
    },
    getStatusIcon(statusId: number): string {
        let className = ``;
        switch (statusId) {
            case StatusId.Active: className = `mdi mdi-check`;break;
            case StatusId.Pending: className = `mdi mdi-clock-outline`; break;
            case StatusId.Banned: className = `mdi mdi-cancel`; break;
            case StatusId.InProgress: className = `mdi mdi-wrench-clock-outline`; break;
            case StatusId.Deleted: className = `mdi mdi-trash-can-outline`; break;
            case StatusId.Disabled: className = `mdi mdi-eye-off-outline`; break;
        }
        return className;
    },
    getUserRoles(roleId: UserRoleId): string {
        let className = ``;
        switch (roleId) {
            case UserRoleId.SuperAdmin: className = `dark`; break;
            case UserRoleId.Admin: className = `primary`; break;
            case UserRoleId.Editor: className = `danger`; break;
            case UserRoleId.Author: className = `success`; break;
            case UserRoleId.User: className = `info`; break;
        }
        return className;
    }
}