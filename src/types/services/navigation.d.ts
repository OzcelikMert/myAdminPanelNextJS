import {PopulateAuthorIdDocument} from "./user";

export interface NavigationDeleteParamDocument {
    _id: string | string[]
}

export type NavigationUpdateStatusIdParamDocument = {
    _id: string | string[],
    statusId: number
}

export type NavigationUpdateParamDocument = {
    _id: string
} & Omit<NavigationAddParamDocument, "authorId">

export type NavigationAddParamDocument = {
    mainId?: string
    contents: Omit<NavigationContentDocument, "_id">
} & Omit<NavigationDocument, "_id"|"contents"|"lastAuthorId"|"authorId"|"mainId"|"createdAt">

export interface NavigationGetParamDocument {
    _id?: string
    langId?: string
    url?: string
    statusId?: number
    maxCount?: number
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
    authorId: PopulateAuthorIdDocument,
    lastAuthorId: PopulateAuthorIdDocument,
    order: number,
    contents?: NavigationContentDocument
}