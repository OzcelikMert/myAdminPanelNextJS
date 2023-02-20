import {PopulateAuthorIdDocument} from "./user";
import LanguageKeys from "../languages";

export interface ComponentGetParamDocument {
    _id?: string
    langId: string,
    getContents?: boolean,
    elementId?: string
}

export interface ComponentDeleteParamDocument {
    _id: string | string[]
}

export type ComponentUpdateRankParamDocument = {
    _id: string[],
    rank: number
}

export type ComponentUpdateParamDocument = { _id: string } & ComponentAddParamDocument

export type ComponentAddParamDocument = {} & Omit<ComponentDocument, "_id"|"lastAuthorId"|"authorId"|"createdAt"|"updatedAt">

export interface ComponentTypeContentDocument {
    langId: string
    content?: string
    url?: string
    comment?: string
}

export interface ComponentTypeDocument {
    _id: string,
    elementId: string
    typeId: number,
    langKey: LanguageKeys,
    rank: number,
    contents?: ComponentTypeContentDocument
}

export interface ComponentDocument {
    _id: string,
    authorId: PopulateAuthorIdDocument
    lastAuthorId: PopulateAuthorIdDocument
    elementId: string
    langKey: LanguageKeys,
    rank: number,
    createdAt: string
    updatedAt: string
    types: ComponentTypeDocument[]
}