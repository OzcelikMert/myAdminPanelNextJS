import LanguageKeys from "../languages";
import {PermissionGroupId} from "constants/index";

interface PermissionGroupDocument {
    id: PermissionGroupId,
    order: number,
    langKey: LanguageKeys
}

export {PermissionGroupDocument}