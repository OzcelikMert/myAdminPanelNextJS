import {UserPopulateDocument} from "./user";
import {PostTermPopulateDocument} from "./postTerm";
import {
    PostContentDocument,
    PostDocument,
    PostECommerceDocument,
    PostECommerceVariationContentDocument,
    PostECommerceVariationDocument
} from "../models/post";
import {ComponentDocument} from "../models/component";

export interface PostAlternateDocument {
    langId: string
    title?: string,
    url?: string
}

export type PostGetOneResultDocument = {
    authorId: UserPopulateDocument,
    lastAuthorId: UserPopulateDocument,
    views?: number,
    categories?: PostTermPopulateDocument[]
    tags?: PostTermPopulateDocument[]
    contents?: PostContentDocument
    components?: ComponentDocument[],
    alternates?: PostAlternateDocument[]
    eCommerce?: (Omit<PostECommerceDocument<PostTermPopulateDocument, PostTermPopulateDocument[]>, "variations"> & {
        variations?: (Omit<PostECommerceVariationDocument<PostTermPopulateDocument>, "contents"> & {
            contents?: PostECommerceVariationContentDocument
        })[]
    })
} & Omit<PostDocument, "contents"|"categories"|"tags"|"components"|"eCommerce">

export type PostGetManyResultDocument = {
    components?: PostDocument["components"]
    eCommerce?: (Omit<PostECommerceDocument, "variations"> & {
        variations?: (Omit<PostECommerceVariationDocument, "contents"> & {
            contents?: PostECommerceVariationContentDocument | PostECommerceVariationContentDocument[]
        })[]
    })
} & Omit<PostGetOneResultDocument, "eCommerce"|"components">

export interface PostGetOneParamDocument {
    typeId: number,
    _id?: string
    pageTypeId?: number
    langId?: string
    url?: string
    statusId?: number,
    ignorePostId?: string[]
}

export interface PostGetManyParamDocument {
    _id?: string[]
    typeId: number[],
    pageTypeId?: number[]
    langId?: string
    statusId?: number,
    count?: number,
    page?: number
    ignorePostId?: string[]
    title?: string
    ignoreDefaultLanguage?: boolean
}

export interface PostGetCountParamDocument {
    typeId: number
    statusId?: number
}

export type PostAddParamDocument = {} & Omit<PostDocument, "_id"|"views">

export type PostUpdateOneParamDocument = {
    _id: string
} & Omit<PostAddParamDocument, "authorId">

export type PostUpdateOneRankParamDocument = {
    _id: string
    typeId: number
    rank: number
    lastAuthorId: string
}

export type PostUpdateOneViewParamDocument = {
    _id: string,
    typeId: number
    langId: string
}

export type PostUpdateManyStatusIdParamDocument = {
    _id: string[],
    typeId: number
    statusId: number,
    lastAuthorId: string
}

export interface PostDeleteManyParamDocument {
    _id: string[]
    typeId: number
}