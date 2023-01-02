import LanguageKeys from "../languages";

export interface SettingStaticLanguageContentDocument {
    _id?: string
    langId: string
    content?: string,
}

export interface SettingStaticLanguageDocument {
    _id?: string
    langKey: LanguageKeys,
    contents: SettingStaticLanguageContentDocument
}

export interface SettingSeoContentDocument {
    langId: string
    title?: string,
    content?: string,
    tags?: string[]
}


export interface SettingContactFormDocument {
    _id?: string
    name: string
    key: string
    outGoingEmail: string
    email: string
    password: string
    outGoingServer: string
    inComingServer: string
    port: number
}

export interface SettingContactDocument {
    email?: string,
    phone?: string,
    address?: string,
    addressMap?: string
    facebook?: string,
    instagram?: string,
    twitter?: string,
    linkedin?: string,
    google?: string,
}

export default interface SettingDocument {
    _id: string
    defaultLangId: string
    icon?: string,
    logo?: string,
    logoTwo?: string
    head?: string,
    script?: string
    seoContents?: SettingSeoContentDocument,
    contact?: SettingContactDocument
    contactForms?: SettingContactFormDocument[]
    staticLanguages?: SettingStaticLanguageDocument[]
}

export interface SettingGetParamDocument {
    langId?: string
}

export type SettingGeneralUpdateParamDocument =  {
    defaultLangId?: string
} & Omit<SettingDocument, "_id"|"defaultLangId"|"seoContents"|"contactForms"|"staticLanguages">

export type SettingSeoUpdateParamDocument =  {
    seoContents: SettingSeoContentDocument
}

export type SettingContactFormUpdateParamDocument =  {
    contactForms: SettingContactFormDocument[]
}

export type SettingStaticLanguageUpdateParamDocument =  {
    staticLanguages: SettingStaticLanguageDocument[]
}
