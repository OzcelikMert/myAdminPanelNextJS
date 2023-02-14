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

export interface PostECommerceVariationSelectedDocument {
    _id?: string
    attributeId: string
    variationId: string
}

export interface PostECommerceVariationDocument {
    _id?: string
    isWarningForIsThereOther?: boolean
    order: number
    selectedVariations: PostECommerceVariationSelectedDocument[]
    images: string[]
    contents?: PostECommerceVariationContentDocument
    inventory: PostECommerceInventoryDocument
    shipping: PostECommerceShippingDocument
    pricing: PostECommercePricingDocument
}

export interface PostECommerceAttributeDocument {
    _id?: string
    attributeId: string
    variationId: string[]
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

export interface PostECommerceDocument {
    typeId: number
    images: string[]
    pricing?: PostECommercePricingDocument
    inventory?: PostECommerceInventoryDocument
    shipping?: PostECommerceShippingDocument
    attributes?: PostECommerceAttributeDocument[]
    variations?: PostECommerceVariationDocument[]
    variationDefaults?: PostECommerceVariationSelectedDocument[]
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
    order: number,
    isFixed?: boolean,
    terms: PopulateTermsDocument[]
    contents?: PostContentDocument,
    components?: ComponentDocument[]
    eCommerce?: PostECommerceDocument
    beforeAndAfter?: PostBeforeAndAfterDocument
    views: number
    sitemap?: string
    createdAt: string
    updatedAt: string
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
}

export type PostAddParamDocument = {
    contents: PostContentDocument
    terms: string[]
    components?: string[],
} & Omit<PostDocument, "_id"|"lastAuthorId"|"authorId"|"views"|"contents"|"terms"|"components"|"createdAt"|"updatedAt">

export type PostUpdateParamDocument = {
    _id: string
} & Omit<PostAddParamDocument, "themeGroups">

export interface PostUpdateStatusParamDocument {
    _id: string[],
    typeId: PostTypeId
    statusId: StatusId,
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