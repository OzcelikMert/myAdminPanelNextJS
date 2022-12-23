import {
    Status,
    StatusId,
    UserRoleId,
    UserRoles
} from "constants/index";
import {PagePropCommonDocument} from "types/pageProps";

export default {
    getStatusForSelect(statusId: StatusId[], t: PagePropCommonDocument["router"]["t"]) {
        return Status.findMulti("id", statusId).map(item => ({
            value: item.id,
            label: t(item.langKey)
        }));
    },
    getUserRolesForSelect(roleId: UserRoleId[], t: PagePropCommonDocument["router"]["t"]) {
        return UserRoles.findMulti("id", roleId).map(item => ({
            value: item.id,
            label: t(item.langKey)
        }));
    }
}