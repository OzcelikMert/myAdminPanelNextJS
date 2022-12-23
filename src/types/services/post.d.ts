import {PopulateTermsDocument} from "./postTerm";
import {PopulateAuthorIdDocument} from "./user";
import {PageTypeId, PostTypeId, StatusId} from "constants/index";
import {ComponentDocument} from "./component";

export interface PostContentButtonDocument {
    _id?: string
    title: string,
    url: string
}

export interface PostContentDocument {
    langId: string
    image?: string,
    title: string,
    content?: string,
    shortContent?: string,
    url?: string,
    seoTitle?: string,
    seoContent?: string
    views?: number
    buttons?: PostContentButtonDocument[]
}

export default interface PostDocument {
    _id: string
    typeId: PostTypeId,
    pageTypeId?: PageTypeId,
    mainId?: {
        _id: string
        contents: {
            langId: string
            title: string,
            url: string,
        }
    },
    statusId: StatusId,
    authorId: PopulateAuthorIdDocument
    lastAuthorId: PopulateAuthorIdDocument
    dateStart: Date,
    order: number,
    views: number,
    isFixed?: boolean,
    terms: (PopulateTermsDocument | undefined)[]
    contents?: PostContentDocument,
    components?: ComponentDocument[]
}

export interface PostGetParamDocument {
    langId: string
    postId?: string
    typeId?: PostTypeId | PostTypeId[]
    statusId?: StatusId
    getContents?: 1 | 0
    maxCount?: number
}

export type PostAddParamDocument = {
    mainId?: string
    isFixed: 1 | 0
    contents: PostContentDocument
    terms: string[]
    components?: string[],
} & Omit<PostDocument, "_id"|"themeGroups"|"mainId"|"lastAuthorId"|"authorId"|"views"|"contents"|"terms"|"isFixed"|"components">

export type PostUpdateParamDocument = {
    postId: string
} & Omit<PostAddParamDocument, "themeGroups">

export interface PostUpdateStatusParamDocument {
    postId: string[],
    typeId: PostTypeId
    statusId: StatusId,
}

export interface PostDeleteParamDocument {
    postId: string[],
    typeId: PostTypeId
}