import {NavigateFunction, Params, PathMatch, URLSearchParamsInit} from "react-router-dom";
import LanguageKeys from "./languages";
import {AppAdminGetState, AppAdminSetState} from "./pages/_app";
import {i18n, TFunction} from "i18next";
import {AppProps} from "next/app";

export interface PagePropCommonDocument {
    router: AppProps["router"],
    t: (key: LanguageKeys) => string
    setBreadCrumb: (titles: string[]) => void
    setSessionData: (data: AppAdminSetState["sessionData"], callBack?: () => void) => void
    getSessionData: AppAdminGetState["sessionData"],
    setPageData: (data: AppAdminSetState["pageData"], callBack?: () => void) => void
    getPageData: AppAdminGetState["pageData"],

}