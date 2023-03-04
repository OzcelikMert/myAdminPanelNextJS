import {UserPopulateDocument} from "./user";
import {PostTermContentDocument, PostTermDocument} from "../models/postTerm";

export interface PostTermPopulateDocument {
    _id: string,
    typeId: number,
    contents: {
        langId: string,
        title?: string,
        image?: string
        url?: string
    }[]
}

export interface PostTermAlternateDocument {
    langId: string
    title?: string,
    url?: string
}

export type PostTermGetResultDocument = {
    authorId: UserPopulateDocument,
    lastAuthorId: UserPopulateDocument,
    mainId?: {
        _id: string
        contents: {
            langId: string
            title: string,
            url: string,
        }
    },
    contents?: PostTermContentDocument | PostTermContentDocument[]
    alternates?: PostTermAlternateDocument[],
    postCount?: number
} & Omit<PostTermDocument, "contents">

export interface PostTermGetOneParamDocument {
    langId?: string
    _id?: string
    typeId: number,
    postTypeId: number,
    url?: string
    statusId?: number,
    ignoreTermId?: string[],
}

export interface PostTermGetManyParamDocument {
    langId?: string
    _id?: string[]
    typeId?: number[],
    postTypeId: number,
    url?: string
    title?: string
    statusId?: number,
    ignoreTermId?: string[],
    count?: number
    page?: number
    withPostCount?: boolean
    ignoreDefaultLanguage?: boolean
}

export type PostTermAddParamDocument = {
    contents?: PostTermContentDocument
} & Omit<PostTermDocument, "_id"|"contents">

export type PostTermUpdateOneParamDocument = {
    _id: string,
} & Omit<PostTermAddParamDocument, "authorId">

export type PostTermUpdateOneRankParamDocument = {
    _id: string,
    postTypeId: number,
    typeId: number
    rank: number,
    lastAuthorId: string
}

export type PostTermUpdateManyStatusIdParamDocument = {
    _id: string[],
    postTypeId: number,
    typeId: number
    statusId: number,
    lastAuthorId: string
}

export interface PostTermDeleteManyParamDocument {
    _id: string[]
    typeId: number,
    postTypeId: number
}