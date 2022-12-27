import SearchParamDocument from "../providers";
import {LanguageId, UserRoleId} from "constants/index";

type AppAdminGetState = {
    isAuth:boolean
    permissionIsValid: boolean
    pageData: {
        langId: string,
        mainLangId: string
    },
    sessionData: {
        id: string,
        langId: LanguageId,
        image: string,
        name: string,
        email: string,
        roleId: UserRoleId,
        permissions: number[]
    }
}

type AppAdminSetState = {
    isAuth?:boolean
    permissionIsValid?: boolean
    pageData?: {
        langId?: string,
        mainLangId?: string,
        isDarkTheme?: boolean
    },
    sessionData?: {
        id?: string,
        langId?: LanguageId,
        image?: string,
        name?: string,
        email?: string,
        roleId?: UserRoleId,
        permissions?: number[]
    }
}

export {
    AppAdminGetState,
    AppAdminSetState
}