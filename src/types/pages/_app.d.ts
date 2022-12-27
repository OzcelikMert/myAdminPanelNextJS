import SearchParamDocument from "../providers";
import {LanguageId, UserRoleId} from "constants/index";
import LanguageDocument from "types/services/language";

type AppAdminGetState = {
    contentLanguages: LanguageDocument[]
    isAppLoading: boolean
    isPageLoading: boolean
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
    contentLanguages?: LanguageDocument[]
    isAppLoading?: boolean
    isPageLoading?: boolean
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