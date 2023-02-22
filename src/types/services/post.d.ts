import {PopulateTermsDocument} from "./postTerm";
import {PopulateAuthorIdDocument} from "./user";
import {PageTypeId, PostTypeId, StatusId} from "constants/index";
import {ComponentDocument} from "./component";
import {AttributeTypeId} from "constants/attributeTypes";

export interface PostECommerceVariationContentDocument {
    _id?: string
    langId: string
    image?: string
    content?: string,
    shortContent?: string,
}

export interface PostECommerceVariationSelectedDocument<T = PopulateTermsDocument> {
    _id?: string
    attributeId: T
    variationId: T
}

export interface PostECommerceVariationDocument<T = PopulateTermsDocument> {
    _id?: string
    isWarningForIsThereOther?: boolean
    rank: number
    selectedVariations: PostECommerceVariationSelectedDocument<T>[]
    images: string[]
    contents?: PostECommerceVariationContentDocument
    inventory: PostECommerceInventoryDocument
    shipping: PostECommerceShippingDocument
    pricing: PostECommercePricingDocument
}

export interface PostECommerceAttributeDocument<T = PopulateTermsDocument> {
    _id?: string
    attributeId: T
    variations: T[]
    typeId: AttributeTypeId
}

export interface PostECommerceShippingDocument {
    width: string
    height: string
    depth: string
    weight: string
}

export interface PostECommerceInventoryDocument {
    sku: string
    isManageStock: boolean
    quantity: number
}

export interface PostECommercePricingDocument {
    taxRate: number
    taxExcluded: number
    taxIncluded: number
    compared: number
    shipping: number
}

export interface PostECommerceDocument<T = PopulateTermsDocument> {
    typeId: number
    images: string[]
    pricing?: PostECommercePricingDocument
    inventory?: PostECommerceInventoryDocument
    shipping?: PostECommerceShippingDocument
    attributes?: PostECommerceAttributeDocument<T>[]
    variations?: PostECommerceVariationDocument<T>[]
    variationDefaults?: PostECommerceVariationSelectedDocument<T>[]
}

export interface PostContentButtonDocument {
    _id?: string
    title: string,
    url: string
}

export interface PostBeforeAndAfterDocument {
    imageBefore: string
    imageAfter: string
    images: string[]
}

export interface PostContentDocument {
    langId: string
    image?: string,
    icon?: string
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
    statusId: StatusId,
    authorId: PopulateAuthorIdDocument
    lastAuthorId: PopulateAuthorIdDocument
    dateStart: Date,
    rank: number,
    isFixed?: boolean,
    categories?: PopulateTermsDocument[]
    tags?: PopulateTermsDocument[]
    contents?: PostContentDocument,
    components?: ComponentDocument[]
    eCommerce?: PostECommerceDocument
    beforeAndAfter?: PostBeforeAndAfterDocument
    views: number
    createdAt: string
    updatedAt: string
    alternates: PostAlternateDocument[]
}

export interface PostAlternateDocument {
    langId: string
    title?: string,
    url?: string
}

export interface PostGetParamDocument {
    _id?: string
    typeId?: PostTypeId | PostTypeId[],
    pageTypeId?: PageTypeId
    langId?: string
    url?: string
    statusId?: StatusId,
    getContents?: boolean,
    count?: number,
    ignorePostId?: string[]
    ignoreDefaultLanguage?: boolean
}

export type PostAddParamDocument = {
    contents: PostContentDocument
    categories?: string[]
    tags?: string[]
    components?: string[],
    eCommerce?: PostECommerceDocument<string>
} & Omit<PostDocument, "_id"|"lastAuthorId"|"authorId"|"views"|"contents"|"categories"|"tags"|"components"|"createdAt"|"updatedAt"|"alternates"|"eCommerce">

export type PostUpdateParamDocument = {
    _id: string
} & PostAddParamDocument

export interface PostUpdateStatusParamDocument {
    _id: string[],
    typeId: PostTypeId
    statusId: StatusId,
}

export interface PostUpdateRankParamDocument {
    _id: string[],
    typeId: PostTypeId
    rank: number,
}

export interface PostUpdateViewParamDocument {
    _id: string,
    typeId: number
    langId: string
}

export interface PostDeleteParamDocument {
    _id: string[],
    typeId: PostTypeId
}