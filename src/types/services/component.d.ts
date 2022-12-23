import {PopulateAuthorIdDocument} from "./user";
import LanguageKeys from "../languages";

export interface ComponentGetParamDocument {
    componentId?: string
    langId: string,
    getContents?: 1,
}

export interface ComponentDeleteParamDocument {
    componentId: string | string[]
}

export type ComponentUpdateParamDocument = { componentId: string } & ComponentAddParamDocument

export type ComponentAddParamDocument = {} & Omit<ComponentDocument, "_id"|"lastAuthorId"|"authorId">

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
    order: number,
    contents?: ComponentTypeContentDocument
}

export interface ComponentDocument {
    _id: string,
    authorId: PopulateAuthorIdDocument
    lastAuthorId: PopulateAuthorIdDocument
    elementId: string
    langKey: LanguageKeys,
    order: number,
    types: ComponentTypeDocument[]
}