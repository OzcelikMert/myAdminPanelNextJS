import {StatusId} from "constants/index";

export default interface LanguageDocument {
    _id: string
    title: string
    image: string
    shortKey: string
    locale: string
    statusId: StatusId
    order: number
    createdAt: string
}

export interface LanguageGetParamDocument {
    _id?: string
    statusId?: StatusId
}

export type LanguageUpdateParamDocument = {
    _id: string
} & LanguageAddParamDocument

export type LanguageAddParamDocument = {} & Omit<LanguageDocument, "_id"|"createdAt">

