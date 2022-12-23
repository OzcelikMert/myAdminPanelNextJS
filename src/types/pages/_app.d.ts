import SearchParamDocument from "../providers";
import {LanguageId, UserRoleId} from "constants/index";

type AppAdminGetState = {
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
    pageData: {
        langId?: string,
        mainLangId?: string,
        isDarkTheme?: boolean
    },
    sessionData: {
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