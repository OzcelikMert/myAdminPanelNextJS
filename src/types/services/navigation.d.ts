import {PopulateAuthorIdDocument} from "./user";

export interface NavigationDeleteParamDocument {
    _id: string | string[]
}

export type NavigationUpdateStatusIdParamDocument = {
    _id: string[],
    statusId: number
}

export type NavigationUpdateRankParamDocument = {
    _id: string[],
    rank: number
}


export type NavigationUpdateParamDocument = {
    _id: string
} & Omit<NavigationAddParamDocument, "authorId">

export type NavigationAddParamDocument = {
    mainId?: string
    contents: Omit<NavigationContentDocument, "_id">
} & Omit<NavigationDocument, "_id"|"contents"|"lastAuthorId"|"authorId"|"mainId"|"createdAt"|"updatedAt">

export interface NavigationGetParamDocument {
    _id?: string
    langId?: string
    url?: string
    statusId?: number
    ignoreDefaultLanguage?: boolean
}

export interface NavigationContentDocument {
    _id?: string
    langId: string
    title: string,
    url?: string,
}

export interface NavigationDocument {
    _id: string
    statusId: number,
    mainId?: {
        _id: string
        contents: {
            langId: string
            title: string,
            url: string,
        }
    }
    createdAt: string
    updatedAt: string
    authorId: PopulateAuthorIdDocument,
    lastAuthorId: PopulateAuthorIdDocument,
    rank: number,
    contents?: NavigationContentDocument
}