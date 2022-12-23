import {UserRoleId} from "constants/index";
import LanguageKeys from "../languages";

interface UserRoleDocument {
    id: UserRoleId,
    rank: number,
    order: number,
    langKey: LanguageKeys
}

export {
    UserRoleDocument
}
