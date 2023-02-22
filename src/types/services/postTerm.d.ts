import {PopulateAuthorIdDocument} from "./user";
import {PostTermTypeId, PostTypeId, StatusId} from "constants/index";

export interface PostTermAlternateDocument {
    langId: string
    title?: string,
    url?: string
}

export interface PostTermContentDocument {
    langId: string
    image?: string,
    title: string,
    shortContent?: string,
    url?: string,
    seoTitle?: string,
    seoContent?: string
}

export default interface PostTermDocument {
    _id: string
    postTypeId: PostTypeId,
    typeId: PostTermTypeId,
    mainId?: PopulateTermsDocument
    statusId: StatusId,
    authorId: PopulateAuthorIdDocument
    lastAuthorId: PopulateAuthorIdDocument
    rank: number,
    contents?: PostTermContentDocument
    alternates?: PostTermAlternateDocument[]
    createdAt: string
    updatedAt: string
    postCount?: number
}

export interface PopulateTermsDocument {
    _id: string,
    typeId: PostTermTypeId
    contents: {
        langId: string,
        title?: string,
        url?: string
        image?: string
    }
}

export interface PostTermGetParamDocument {
    url?: string
    ignoreTermId?: string[],
    count?: number
    langId: string
    typeId?: PostTermTypeId
    postTypeId: PostTypeId
    _id?: string
    statusId?: StatusId
    withPostCount?: boolean
    ignoreDefaultLanguage?: boolean
}

export type PostTermAddParamDocument = {
    mainId?: string
    contents: PostTermContentDocument
} & Omit<PostTermDocument, "_id"|"mainId"|"lastAuthorId"|"authorId"|"views"|"contents"|"alternates"|"createdAt"|"updatedAt"|"postCount">

export type PostTermUpdateParamDocument = {
    _id: string
} & PostTermAddParamDocument

export interface PostTermUpdateStatusParamDocument {
    _id: string[]
    typeId: PostTermTypeId
    postTypeId: PostTypeId
    statusId: StatusId
}

export interface PostTermUpdateRankParamDocument {
    _id: string[]
    typeId: PostTermTypeId
    postTypeId: PostTypeId
    rank: number
}

export interface PostTermDeleteParamDocument {
    _id: string[]
    typeId: PostTermTypeId
    postTypeId: PostTypeId
}