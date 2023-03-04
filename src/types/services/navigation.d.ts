import {UserPopulateDocument} from "./user";
import {NavigationContentDocument, NavigationDocument} from "../models/navigation";

export type NavigationGetResultDocument = {
    authorId: UserPopulateDocument,
    lastAuthorId: UserPopulateDocument,
    mainId?: {
        _id:  string
        contents: {
            langId: string
            title: string,
            url: string,
        }
    },
    contents?: NavigationContentDocument | NavigationContentDocument[]
} & Omit<NavigationDocument, "contents">

export interface NavigationGetOneParamDocument {
    _id?: string
    langId?: string
    statusId?: number
}

export interface NavigationGetManyParamDocument {
    _id?: string[]
    langId?: string
    statusId?: number
    ignoreDefaultLanguage?: boolean
}

export type NavigationAddParamDocument = {
    contents?: Omit<NavigationContentDocument, "_id">
} & Omit<NavigationDocument, "_id"|"contents">

export type NavigationUpdateOneParamDocument = {
    _id: string
} & Omit<NavigationAddParamDocument, "authorId">

export type NavigationUpdateOneRankParamDocument = {
    _id: string
    rank: number,
    lastAuthorId: string
}

export type NavigationUpdateManyStatusIdParamDocument = {
    _id: string[],
    statusId: number,
    lastAuthorId: string
}

export interface NavigationDeleteManyParamDocument {
    _id: string[]
}